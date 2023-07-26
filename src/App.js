import "./App.css";
import Navigation from "./components/Navigation/Navigation";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import Signin from "./components/Signin/Signin";
import Register from "./components/Register/Register";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import ParticlesBg from "particles-bg";
import "tachyons";
import { Component } from "react";

const initialState = {
  input: "",
  imageUrl: "",
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState(
        {
          user: {
            id: data.id,
            name: data.name,
            email: data.email,
            entries: data.entries,
            joined: data.joined
          }
        })
  }
  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)      
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box})
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  };

  onButtonSubmit = () => {
    // URL of image to use. Change this to your image.
    const IMAGE_URL = this.state.input;
    this.setState({imageUrl: IMAGE_URL})

    // NOTE: MODEL_VERSION_ID is optional, you can also call prediction with the MODEL_ID only
    // https://api.clarifai.com/v2/models/{YOUR_MODEL_ID}/outputs
    // this will default to the latest version_id

    fetch('https://smart-brain-api-308j.onrender.com/imageurl', {
      method:'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        input: IMAGE_URL
      })
    })
      .then((result) => result.json())
        .then(response => {
        if(response) {
          fetch("https://smart-brain-api-308j.onrender.com/image", {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
              .then(response => response.json())
              .then(count => {
                this.setState(Object.assign(this.state.user, {entries: count}))
              })
              .catch(console.log)
        }
        console.log("Response:" + response);
        // THE BOX DOES NOT DISPLAY
        let res = JSON.parse(response);
        this.displayFaceBox(this.calculateFaceLocation(res))
      })
      .catch((error) => console.log("error", error));
  };

  onRouteChange = (route) => {
    if(route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render() {
    const {isSignedIn, imageUrl, route, box} = this.state;
    return (
      <div className="App">
        <ParticlesBg type="cobweb" bg={true} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        { route === 'home'
            ? <div>
              <Logo />
              <Rank
                  name = {this.state.user.name}
                  entries = {this.state.user.entries}/>
              <ImageLinkForm
                  onInputChange={this.onInputChange}
                  onButtonSubmit={this.onButtonSubmit}
              />
              <FaceRecognition box = {box} imageUrl={imageUrl}/>
            </div>
            : (
                route === 'signin'
                ? <Signin
                        loadUser={this.loadUser}
                        onRouteChange={this.onRouteChange}/>
                : <Register
                        loadUser={this.loadUser}
                        onRouteChange={this.onRouteChange}/>
           )
        }
      </div>
    );
  }
}

export default App;
