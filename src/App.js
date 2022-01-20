import axios from 'axios';
import React, { Component } from 'react';
import './App.css';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
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
    tableAlert: {
      showAlert: true,
      severity: 'success',
      alertTitle: 'Hooray or sorry!!!',
      alertDetail: 'You deleted all the products!'
    },
    loading: false,
    showProgress: false,
    file: '',
    taskId: '',
    taskProgress: {},
    delay: 3000
  }

  // eventSource = new EventSource(`${process.env.REACT_APP_BACKEND_DOMAIN}/api/v1/products/stream/${this.state.taskId}`)

  componentDidMount = () => {
    this.handleFetchProducts();
    // this.eventSource.onmessage = e => {
    //   console.log(e.data);
    // }
    // if (this.state.showProgress) {
    //   this.interval = setInterval(this.handleUploadProgress, this.state.delay);
    // }
  }

  componentDidUpdate = async (prevProps, prevState) => {
    if (prevState.taskId !== this.state.taskId) {
      // axios({
      //   method: 'get',
      //   url: `${process.env.REACT_APP_BACKEND_DOMAIN}/api/v1/products/stream/${this.state.taskId}`,
      //   responseType: 'stream',
      //   crossorigin: true,
      // }).then(response => {
      //   console.log(response.data);
      // })
      console.log(`${process.env.REACT_APP_BACKEND_DOMAIN}/api/v1/products/stream/${this.state.taskId}`)
      const eventSource = new EventSource(
        `${process.env.REACT_APP_BACKEND_DOMAIN}/api/v1/products/stream/${this.state.taskId}`,
        // {withCredentials: true}
        );

      console.log(`>>>>>>>> previous ${prevState.taskId} >>>>>>> current ${this.state.taskId}`);
      console.log(typeof(eventSource));
      eventSource.onmessage = e => {
        console.log(e.data);
        console.log(typeof(e.data));

      }
      eventSource.onclose = e => {
        console.log("Closed stream");
      }
      eventSource.onerror = function(err) {
        console.error("EventSource failed:", err);
      };
    }
    // if (this.state.showProgress) {
    //   this.interval = setInterval(() => {
    //     this.handleUploadProgress();
    //   }, this.state.delay);
    // }
  }

  // componentWillUnmount(){
  //   clearInterval(this.interval);
  // }

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
        `${process.env.REACT_APP_BACKEND_DOMAIN}/api/v1/products/`,
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
    axios.get(`${process.env.REACT_APP_BACKEND_DOMAIN}/api/v1/products/`)
    .then(response => {
        this.setState({
        ...this.state,
        products: response.data,
        productsList: response.data.results
      });
    }).catch(err => console.log(err))
  }

  handleDeleteProducts = (sku=null) => {
    this.setState({
      ...this.state,
      loading: true,
    })
    let url = sku ? `${process.env.REACT_APP_BACKEND_DOMAIN}/api/v1/products/product/${sku}/` : `${process.env.REACT_APP_BACKEND_DOMAIN}/api/v1/products/product/`;
    console.log(typeof(url));
    axios.delete(url)
      .then(response => {
        console.log(response)
        this.setState({
          ...this.state,
          loading:false,
          tableAlert: {
            showAlert: true,
            severity: 'success',
            alertTitle: 'Hooray!!!',
            alertDetail: 'Product(s) successfully deleted!'
          } 
        });
      }).catch(err => console.log(err))
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
        `${process.env.REACT_APP_BACKEND_DOMAIN}/api/v1/products/upload/`,
        data,
        )
        .then(response => {
          this.setState({
            ...this.state,
            loading:true,
            taskId: response.data.task_id,
            showProgress: true
          });
          // this.handleTaskProgressStream(response.data.task_id);
        }).catch(err => console.log(err))
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
    console.log(this.state.taskProgress);
    if (this.state.taskProgress.complete) {
      console.log(this.state.taskProgress);
      clearInterval(this.interval);
      this.setState({
        ...this.state,
        taskId: '',
        showProgress: false,
        loading: false,
        alert: {
          showAlert: true,
          severity: 'success',
          alertTitle: 'Hooray!!!',
          alertDetail: 'Your products were uploaded successfully!'
        }
      })
    } else {
      console.log(`${process.env.REACT_APP_BACKEND_DOMAIN}/celery-progress/${this.state.taskId}`)
      axios.get(
        `${process.env.REACT_APP_BACKEND_DOMAIN}/celery-progress/${this.state.taskId}`
        ).then(response => {
          console.log(response.data)
          this.setState({
              ...this.state,
              taskProgress: {...response.data}
          })
    }).catch(err => {
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

  handleTaskProgressStream = (taskId) => {
    let eventSource = new EventSource(`${process.env.REACT_APP_BACKEND_DOMAIN}/api/v1/products/stream/${taskId}`);

    eventSource.onopen = () => {
      console.log(`Console open . . .`)
      this.setState({
        ...this.state,
        loading: true,
      });
    }

    eventSource.onmessage = e => {
      console.log(e.data);
      // this.setState({
      //   ...this.state,
      //   taskProgress: 
      // })
    }

    eventSource.onclose = e => {
      console.log(`error `, e);
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
    // if (this.state.taskId) {
    //   let eventSource = new EventSource(`${process.env.REACT_APP_BACKEND_DOMAIN}api/v1/products/stream/${this.state.taskId}`);

    //   eventSource.onopen = () => {
    //     console.log(`Console open . . .`)
    //     this.setState({
    //       ...this.state,
    //       loading: true,
    //     });
    //   }

    //   eventSource.onmessage = e => {
    //     console.log(e.data);
    //     // this.setState({
    //     //   ...this.state,
    //     //   taskProgress: 
    //     // })
    //   }

    //   eventSource.onclose = e => {
    //     console.log(`error `, e);
    //   }
    // }
    
    // this.handleTaskProgressStream();
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
          this.state.showProgress &&
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
                );
              }
            }} */}
          {/* />
        } */}
        {
          Object.keys(this.state.taskProgress).length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant="determinate" value={this.state.taskProgress.progress.percent} />
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
                <TableCell align={"right"}>
                  <Button
                    variant="contained"
                    startIcon={<DeleteForeverIcon/>}
                    onClick={this.handleDeleteProducts} 
                    disabled={this.state.loading}
                    color="error"
                  >
                    {
                      this.state.loading ?
                      (<CircularProgress size={30} color="error" />) :
                      ('Delete All Products')
                    }
                  </Button>
                </TableCell>
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
                      <TableCell align={"right"}>
                        <Button
                          variant="contained"
                          startIcon={<DeleteForeverIcon/>}
                          onClick={this.handleDeleteProducts.bind(this, product.sku)} 
                          disabled={this.state.loading}
                          color="error"
                        >
                          {
                            this.state.loading ?
                            (<CircularProgress size={30} color="error" />) :
                            ('Delete(this product)')
                          }
                        </Button>
                      </TableCell>
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
