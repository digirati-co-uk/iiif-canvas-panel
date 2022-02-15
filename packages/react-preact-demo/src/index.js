import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { DrawingBoxes1 } from "./DrawingBoxes1";
import { ImageService } from "./ImageService";

ReactDOM.render(
  <React.StrictMode>
    <ImageService />
    <DrawingBoxes1 />
    <App/>
  </React.StrictMode>,
  document.getElementById('root')
);

