const mongoose = require('mongoose');

const connectToDB=()=>{
    mongoose.connect(process.env.DB, { useNewUrlParser: true })
  .then(() => console.log(`Database connected successfully`))
  .catch(err => console.log(err));

    
}

module.exports=connectToDB