import React, { Component } from "react";
import { uniqueId } from "lodash";
import filesize from "filesize";

import api from "./services/api";

import GlobalStyle from "./styles/global";
import { Container, Content } from "./styles";

import Upload from "./components/Upload";

import { saveAs } from 'file-saver'

class App extends Component {
  state = {
    uploadedFiles: [],
    imagem: {}
  };

  async componentDidMount() {
    const response = await api.get("posts");

    this.setState({
      uploadedFiles: response.data.map(file => ({
        id: file._id,
        name: file.name,
        readableSize: filesize(file.size),
        preview: file.url,
        uploaded: true,
        url: file.url
      }))
    });
  }

  handleUpload = files => {
    const uploadedFiles = files.map(file => ({
      file,
      id: uniqueId(),
      name: file.name,
      readableSize: filesize(file.size),
      preview: URL.createObjectURL(file),
      progress: 0,
      uploaded: false,
      error: false,
      url: null
    }));

    this.setState({
      uploadedFiles: this.state.uploadedFiles.concat(uploadedFiles)
    });

    uploadedFiles.forEach(this.processUpload);
  };

  updateFile = (id, data) => {
    this.setState({
      uploadedFiles: this.state.uploadedFiles.map(uploadedFile => {
        return id === uploadedFile.id
          ? { ...uploadedFile, ...data }
          : uploadedFile;
      })
    });
  };

  processUpload = uploadedFile => {
    const data = new FormData();

    data.append("file", uploadedFile.file, uploadedFile.name);

    api
      .post("posts", data, {
        onUploadProgress: e => {
          const progress = parseInt(Math.round((e.loaded * 100) / e.total));

          this.updateFile(uploadedFile.id, {
            progress
          });
        }
      })
      .then(response => {
        this.base64ToImage(response);
      })
      .catch(() => {
        console.log("ERRO");
      });
  };

  base64ToImage(response){
    let dataurl = 'data:image/png;base64,' + response.data;
    
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    let newData = new File([u8arr], 'AcademiaDigital.png', {type:mime});

    this.setState({
      imagem: newData
    });

    this.downloadImage();
  }

  downloadImage = () => {
    console.log("DOWNLOAD", this.state.imagem)
    
    saveAs(this.state.imagem);
  }

  render() {
    return (
      <Container>
        <Content>
          <Upload onUpload={this.handleUpload} />
          {/* <button onClick={this.downloadImage}>Download!</button> */}
        </Content>
        <GlobalStyle />
      </Container>
    );
  }
}

export default App;
