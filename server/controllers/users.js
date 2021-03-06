const User = require('../db/models/user'),
  mongoose = require('mongoose'),
  jwt = require('jsonwebtoken'),
  cloudinary = require('cloudinary').v2,
  {
    sendWelcomeEmail,
    sendCancellationEmail,
    forgotPasswordEmail
  } = require('../emails/index');

//create a user
exports.createUser = async (req, res) => {
  const { name, email, password, username } = req.body;
  try {
    const user = new User({
      name,
      email,
      password,
      username
    });
    await user.save();

    sendWelcomeEmail(email, name);
    const token = await user.generateAuthToken();
    res.cookie('jwt', token, {
      httpOnly: true,
      sameSite: 'Strict',
      secure: process.env.NODE_ENV !== 'production' ? false : true
    });
    res.status(201).json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

//login to user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();

    res.cookie('jwt', token, {
      httpOnly: true,
      sameSite: 'Strict',
      secure: process.env.NODE_ENV !== 'production' ? false : true
    });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

//request password reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.query;

    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');
    const token = jwt.sign(
      { _id: user._id.toString(), name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    forgotPasswordEmail(email, token, user.name);
    res.json({ message: 'reset password email sent!' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.passwordRedirect = async (req, res) => {
  const { token } = req.params;
  try {
    jwt.verify(token, process.env.JWT_SECRET, function (err) {
      if (err) throw new Error(err.message);
    });
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 600000,
      sameSite: 'Strict'
    });
    res.redirect(process.env.URL + '/update-password');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//AUTHENTICATED ROUTES
//Get a user
exports.getCurrentUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id)
    .populate('jobs')
    .populate('portfolios')
    .populate('events')
    .populate('images')
    .populate('videos')
    .populate('followers');

  res.json({
    ...user.toObject(),
    jobs: user.jobs,
    portfolios: user.portfolios,
    events: user.events,
    images: user.images,
    videos: user.videos
  });
};

// Update a user
exports.updateCurrentUser = async (req, res) => {
  const updates = Object.keys(req.body); // => ['email', 'name', 'password']
  const allowedUpdates = [
    'name',
    'email',
    'password',
    'avatar',
    'header',
    'username',
    'bio',
    'mentor',
    'location',
    'number',
    'website'
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation)
    return res.status(400).json({ message: 'Invalid updates' });
  try {
    //Loop through each update, and change the value for the current user to the value coming from the body
    updates.forEach((update) => (req.user[update] = req.body[update]));
    //save the updated user in the db
    await req.user.save();
    //send the updated user as a response
    res.json(req.user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Logout a user
exports.logoutUser = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.cookies.jwt;
    });
    await req.user.save();
    res.clearCookie('jwt');
    res.json({ message: 'logged out!' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Logout all devices
exports.logoutAllDevices = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.clearCookie('jwt');
    res.json({ message: 'logged out from all devices!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    await req.user.remove();
    sendCancellationEmail(req.user.email, req.user.name);
    res.clearCookie('jwt');
    res.json({ message: 'user deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    const response = await cloudinary.uploader.upload(
      req.files.images.tempFilePath
    );
    req.user.avatar = response.secure_url;
    await req.user.save();
    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//Update password
exports.updatePassword = async (req, res) => {
  try {
    req.user.password = req.body.password;
    await req.user.save();
    res.clearCookie('jwt');
    res.status(200).json({ message: 'Password updated successfully!' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('jobs')
      .populate('portfolios')
      .populate('events')
      .populate('images')
      .populate('videos')
      .populate('followers');

    const parsedUsers = users.map((user) => ({
      user: user,
      jobs: user.jobs,
      portfolios: user.portfolios,
      events: user.events,
      images: user.images,
      videos: user.videos
    }));

    res.status(200).json(parsedUsers);
    // res.status(200).json(req.user)
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.followUser = async (req, res) => {
  try {
    const userToFollow = await User.findOne({ _id: req.params.id });
    //If my id is already included in the followers array, remove it by filter (thus unfollowing)
    if (userToFollow.followers.includes(req.user._id)) {
      userToFollow.followers = userToFollow.followers.filter((id) => {
        return id.toString() !== req.user._id.toString();
      });

      await userToFollow.save();
      // Filter OUT the userToFollow's id from the people i am "following"
      req.user.followers = req.user.followers.filter((id) => {
        return id.toString() !== userToFollow._id.toString();
      });
      await req.user.save();
      return res.status(200).json({
        message: `You have unfollowed ${userToFollow.username}`
      });
    }

    userToFollow.followers.push(req.user._id);
    await userToFollow.save();
    req.user.following.push(userToFollow._id);
    await req.user.save();
    res
      .status(200)
      .json({ message: `You are now following ${userToFollow.username}` });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.getUserById = async (req, res) => {
  const _id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(400).json({ message: 'User not found :-(' });
  try {
    const user = await User.findById(_id)
      .populate('jobs')
      .populate('portfolios')
      .populate('events')
      .populate('images')
      .populate('videos')
      .populate('followers');

    if (!user) return res.status(400).json({ message: 'User not found :-(' });

    res.status(200).json({
      user: user,
      jobs: user.jobs,
      portfolios: user.portfolios,
      events: user.events,
      images: user.images,
      videos: user.videos
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
