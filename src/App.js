import axios from 'axios';
import React, { Component } from 'react';
import './App.css';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinearProgress from '@mui/material/LinearProgress';
// import ReactPolling from 'react-polling';

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'


class App extends Component {

  state = {
    sku: '',
    name: '',
    description: '',
    products: {},
    productsList: [],
    alert: {
      showAlert: false,
      severity: "",
      alertTitle: "",
      alertDetail: "",
    },
    loading: false,
    file: '',
    taskProgress: {},
    delay: 3000
  }

  componentDidMount = () => {
    this.handleFetchProducts();
    if (this.state.taskId) {
      this.interval = setInterval(this.handleUploadProgress, this.state.delay);
    }
  }

  handleSubmitForm = event => {
    if (!this.state.sku) {
      this.setState({
        ...this.state,
        alert: {
          showAlert: true,
          severity: 'error',
          alertTitle: 'Error',
          alertDetail: 'Please fill in the SKU field!'
        }
      });
    } else if (!this.state.name) {
      this.setState({
        ...this.state,
        alert: {
          showAlert: true,
          severity: 'error',
          alertTitle: 'Error',
          alertDetail: 'Please fill in the Name field!'
        }
      });
    } else if (!this.state.description) {
      this.setState({
        ...this.state,
        alert: {
          showAlert: true,
          severity: 'error',
          alertTitle: 'Error',
          alertDetail: 'Please fill in the Description field!'
        }
      });
    } else {
      this.setState({
        ...this.state,
        loading: true
      })
      axios.post(
        `http://localhost:8000/api/v1/products/`,
        {
          sku: this.state.sku,
          name: this.state.name,
          description: this.state.description
        }).then(response => this.setState({
          ...this.state,
          loading: false,
          alert: {
            showAlert: true,
            severity: 'success',
            alertTitle: 'Hooray!!!',
            alertDetail: 'Product successfully created!'
          }
        })).catch(err => console.log(err))
    }
  }

  handleFetchProducts = () => {
    axios.get(`http://localhost:8000/api/v1/products/`)
    .then(response => this.setState({
      ...this.state,
      products: response.data,
      productsList: response.data.results
    })).catch(err => console.log(err.sku))
  }

  handleChange = event => {
    this.setState({
      ...this.state,
      [event.target.name]: event.target.value,
    });
  }

  handleFileUpload = (event) => {
    if (event.target.files.length) {
      const data = new FormData();
      data.append('file', event.target.files[0])

      axios.post(
        `http://localhost:8000/api/v1/products/upload/`,
        data,
        )
        .then(response => this.setState({
          ...this.state,
          loading:true,
          taskId: response.data.task_id
        })).catch(err => console.log(err))
    } else {
      this.setState({
        ...this.state,
        alert: {
          showAlert: true,
          severity: 'error',
          alertTitle: 'Oops!!!',
          alertDetail: 'The file you are uploading is empty!'
        }
      })
    }
  }

  handleUploadProgress = () => {
    if (Object.keys(this.state.taskProgress).length && this.state.taskProgress.complete) {
      this.setState({
        ...this.state,
        taskId: '',
        alert: {
          showAlert: true,
          severity: 'success',
          alertTitle: 'Hooray!!!',
          alertDetail: 'Your products were uploaded successfully!'
        }
      })
    } else {
      axios.get(
        `http://localhost:8000/celery-progress/` + this.state.taskId
        ).then(response => this.setState({
          ...this.state,
          taskProgress: response.data
      })
      ).catch(err => {
        this.setState({
          ...this.state,
          alert: {
            showAlert: true,
            severity: 'error',
            alertTitle: 'Oops!!!',
            alertDetail: 'An error occurred while trying to track your upload progress!'
          }
        })
      })
    }
  }

  clearAlert = () => {
    setTimeout(() => {
      this.setState({
        ...this.state,
        alert: {
          showAlert: false,
          severity: "",
          alertTitle: "",
          alertDetail: "",
        },
      });
    }, 5000);

  }

  render() {
    return (
      <div className="App">
        {this.state.alert.showAlert && (
            <Alert
              severity={this.state.alert.severity}
              onClose={this.clearAlert()}
            >
              <AlertTitle>{this.state.alert.alertTitle}</AlertTitle>
              {this.state.alert.alertDetail}
            </Alert>
          )
        }
        <Box
          component="form"
          sx={{
            '& > :not(style)': { m: 1, width: '25ch' },
            margin: '5% auto'
          }}
          autoComplete="off"
        >
          <TextField id="outlined-basic" label="SKU" variant="outlined" name="sku" onChange={this.handleChange} required/><br/><br/>
          <TextField id="filled-basic" label="Name" variant="outlined" name="name" onChange={this.handleChange} required/><br/><br/>
          <TextField id="standard-basic" label="Description" variant="outlined" name="description" onChange={this.handleChange} required/><br/><br/>          
          <Button
            variant="contained"
            startIcon={<AddCircleIcon/>}
            onClick={this.handleSubmitForm} 
            disabled={this.state.loading}
          >
            {
              this.state.loading ?
              (<CircularProgress size={30} color="primary" />) :
              ('Add Product')
            }
          </Button><br/><br/>
          <p style={{margin: 'auto'}}>Or Upload a batch of products</p><br/><br/>
          <input
            accept=".csv"
            style={{display: 'None'}}
            id="file"
            type="file"
            onChange={this.handleFileUpload}
            disabled={this.state.loading}
          />
          <label htmlFor="file">
            <Button
              color='primary'
              component='span'
              startIcon={<CloudUploadIcon />}
              disabled={this.state.loading}
            >
              {
                this.state.loading ?
                (<CircularProgress size={30} color='primary' />) :
                ('Upload Product CSV')
              }
            </Button>
          </label>
          <span>{this.state.file.name}</span>
        </Box>
        {/* {
          this.state.taskId &&
          <ReactPolling
            url={`http://locahost:8000/celery-progress/ ${this.state.taskId}`}
            interval= {3000} // in milliseconds(ms)
            retryCount={3} // this is optional
            onSuccess={(response) => this.setState({
              ...this.state,
              taskProgress: response.data
            })}
            onFailure={() => console.log('handle failure')} // this is optional
            method={'GET'}
            render={({ startPolling, stopPolling, isPolling }) => {
              if(isPolling) {
                this.setState({
                  ...this.state,
                  loading: true
                })
              } else {
                return (
                  <div> Hello I stopped polling</div>
                );
              }
            }}
          />
        } */}
        {
          Object.keys(this.state.taskProgress).length && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant="determinate" value={this.state.taskProgress.percent} />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">{`${Math.round(
                  this.state.taskProgress.percent
                )}%`}</Typography>
              </Box>
            </Box>
          )
        }
        <TableContainer component={Paper}>
          <Table>
          <TableHead>
              <TableRow >
                <TableCell style={{color: "#fff"}}>SKU</TableCell>
                <TableCell align={"right"}>Name</TableCell>
                <TableCell align={"right"}>Description</TableCell>
                <TableCell align={"right"}>Active</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                !this.state.productsList.length ?
                (<Typography align='center' paragraph>There are no products yet</Typography>) :
                (this.state.productsList.map(product => {
                  return (
                    <TableRow hover={true} key={product.id}>
                      <TableCell >{product.sku}</TableCell>
                      <TableCell align={"right"}>{product.name}</TableCell>
                      <TableCell align={"right"}>{product.description}</TableCell>
                      <TableCell align={"right"}>{product.active ? 'Active' : 'Inactive'}</TableCell>
                    </TableRow>
                  );
                }))
              }
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    );
  }
}

export default App;
