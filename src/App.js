import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import './App.css';


const app = new Clarifai.App({
  apiKey: 'd0a2ab07bf7e439db2b9281fd0f5f603'
});

const particlesOptions = {
  particles: {
    number: {
      value: 40,
      density: {
        enable: true,
        value_area: 1000
      }
    }
  }
}

class App extends Component {
  constructor(){
    super();
    this.state={
      input: '',
      imageUrl: '',
      boxes: [],
      route: 'signin',
      isSignedIn: false
    }
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions.map(region => region.region_info.bounding_box);
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return clarifaiFace.map(face => {
      return {
        leftCol: face.left_col * width,
        topRow: face.top_row * height,
        rightCol: width - (face.right_col * width),
        bottomRow: height - (face.bottom_row * height)
      }
    });
  }

  displayFaceBox = (boxes) => {
    // console.log(boxes);
    this.setState({boxes: boxes})
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});  
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    app.models.predict(
      'a403429f2ddf4b49b307e318f00e528b', 
       this.state.input)
      .then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
        // console.log(response.outputs[0].data.regions[0].region_info.bounding_box); 
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if(route === 'signout') {
      this.setState({isSignedIn: false})
    } else if (route === 'home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render(){
    const { isSignedIn, imageUrl, route, boxes } = this.state;
    return (
      <div className="App">
        <Particles className='particles'
          params={particlesOptions}
        />
          
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        { route === 'home' 
            ? <div>
                <Logo />
                <Rank />
                <ImageLinkForm 
                onInputChange={this.onInputChange} 
                onButtonSubmit={this.onButtonSubmit}/>
                
                <FaceRecognition boxes={boxes} imageUrl={imageUrl}/>
              </div>
            : (
              route === 'signin' 
              ? <Signin onRouteChange={this.onRouteChange}/>
              : <Register onRouteChange={this.onRouteChange}/>
            )
            
        }
      </div>
    );
  }
  
}

export default App;
