import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import ImageModal from '../helper/ImageModal';
import VideoModal from '../helper/VideoModal';

const ProfileBody = () => {
  const [portfolio, setPortfolio] = useState('');
  let { id } = useParams();

  useEffect(() => {
    axios
      .get(`/portfolios/${id}`, { withCredentials: true })
      .then((response) => {
        setPortfolio(response.data[0]);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <>
      <div className="profaction">
        <button type="button" class="btn btn-secondary">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0WAyaJrUiyNzGF79cfqxPHybAqK9UIMkREQ&usqp=CAU"
            alt="user"
          />
          <ImageModal />
        </button>

        <button type="button" class="btn btn-secondary">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdQoTtapY7Cof1aGJJRT2BTYfq3TtMY5NPZw&usqp=CAU"
            alt="user"
          />
          <VideoModal />
        </button>
      </div>
      <div className="profbody">
        <div>
          <h6>Works at:</h6>
          <p>{portfolio?.company}</p>
        </div>
        <div>
          <h6>Position:</h6>
          <p>{portfolio?.position}</p>
        </div>
        <div>
          <h6>Studied at:</h6>
          <p>{portfolio?.school}</p>
        </div>
        <div className="profdescription">
          <h3>About me:</h3>
          <p>{portfolio?.description}</p>
        </div>
      </div>
      <Footer className="foot" />
    </>
  );
};

export default ProfileBody;
