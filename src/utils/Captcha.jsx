import React, { useEffect, useState } from "react";


import axios from "axios";

const Captcha = ( props ) => {
  const [captchaImage, setCaptchaImage] = useState("");
    
  // Function to fetch captcha image
  // const fetchCaptcha = async () => {
  //   try {
  //     const timestamp = new Date().getTime(); // Add a timestamp to prevent caching
  //     setCaptchaUrl(
  //       `${process.env.REACT_APP_URL}/auth/captcha-image?t=${timestamp}`
  //     );
  //   } catch (error) {
  //     console.error("Error fetching captcha", error);
  //   }
  // };

    const fetchCaptcha = async () => {
    try {
       const timestamp = new Date().getTime();
      const response = await axios.get( `${process.env.SPRING_URL}/auth/captcha-image?t=${timestamp}`); 
      const { image, salt } = response.data;

      setCaptchaImage(`data:image/jpeg;base64,${image}`);
      //setSalt(salt);
      props.onSaltChange(salt);
    } catch (error) {
      console.error('Failed to fetch captcha:', error);
    }
  };

  // Fetch captcha on component mount
  useEffect(() => {
    fetchCaptcha();
  }, [props.reCaptcha]);

  return (
    <div className="form-group1">
      <div className="captcha-wrapper">
        {/* Use the dynamically set captcha URL  */}
         {captchaImage && <img src={captchaImage} height="40px" alt="captcha" id="captchaImage" />}
        {/* <img src={captchaImage} height="40px" alt="captcha" id="captchaImage" /> */}
        {/* <div
          id="captchaRefreshIcon"
          className="captcha-regen-icon"
          onClick={fetchCaptcha}
        >
           
        </div> */}
        
      </div>
      
    </div>
  );
};

export default Captcha;