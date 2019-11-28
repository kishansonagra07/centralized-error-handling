const express = require('express');
const AppError = require('./handler/appError');
const fs = require('fs');
const app = express();
require('dotenv').config();
app.use(express.json());

app.get('/',(req,res) => {
    return res.status(200).json({
        message:"Welcome to home page"
    });
});

app.get('/about',(req,res,next) => {
   fs.access(__dirname+'/about.html', fs.F_OK, (err) => { // without blocking it will throw an error if file not present
        if(err) return next(new AppError('File not found',404));
        /*err.status = 'failed'; err.statusCode = 422; err.message = 'File Not found'; // (write your custom error message)
        return next(err); // (it will give actual error message)*/
        res.sendFile(__dirname+'/about.html');
    });
});

app.post('/add',(req,res,next) => {
    const userObject = {
        name : req.body.name,
        age : req.body.age,
        bod : req.body.dob
    }
    fs.readFile('./users.json', 'utf-8', function(err, data) {
        if (err)  return next(new AppError('File not found',404));
    
        var arrayOfObjects = JSON.parse(data)
        arrayOfObjects.users.push(userObject);
    
        fs.writeFile('./users.json', JSON.stringify(arrayOfObjects,null,4), 'utf-8', function(err) {
            if (err)  return next(new AppError('Something went wrong',500));
        })
    })
    res.status(200).json({
        status:'success',
        message : 'Data Added Successfully'
    });
 });
 

// centralized error handler - note how it has four parameters
// production error handler, no stacktraces leaked to user
app.use((err,req,res,next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development'){
        res.status(err.statusCode).json({
            status: err.status,
            error:err,
            message:err.message,
            stack:err.stack
        });
    }else if(process.env.NODE_ENV === 'production'){
        // Operational, trusted error : send message to client
        if(err.isOperational){
            res.status(err.statusCode).json({
                status:err.status,
                message:err.message
            });
        // programming and other error : dont leak error details to client
        } else {
            res.status(500).json({
                status : 'error',
                message : 'Something went wrong'
            });
        }
    }   
});
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
