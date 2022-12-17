const express = require('express');
const app = express();
const mongoose = require("mongoose")
var cors = require('cors')
// require("./db/conn");
const todomodel = require("./models/Items");
const Pusher = require('pusher');
// require('dotenv').config({path: './.env'})
require('dotenv').config({path: '../.env'});

console.log(process.env.DATABASE_URL);

const port = process.env.PORT || 8080;


app.use(express.json());
app.use(cors())



const connect_url = "mongodb+srv://jack:X8Fb6yUoZSNmBBV1@cluster0.vnpdu0b.mongodb.net/?retryWrites=true&w=majority";

// const connect_url = process.env.DATABASE_URL;

// X8Fb6yUoZSNmBBV1
mongoose.connect(connect_url).then(()=>{
console.log("Connected to database");
}).catch((err)=>{
console.log(`Error connecting to database: ${err}`);
})

const pusher = new Pusher({
    appId: "1502248",
    key: "821becf82cf33c9ab849",
    secret: "0fd68d9ffe7802a67aaf",
    cluster: "ap2",
    useTLS: true
});

const db = mongoose.connection;
//once the connection is open
db.once("open", ()=>{
    // console.log('db con')
    const todoCollection = db.collection("todomodels");
    // console.log(todoCollection)
    // watch collection
    const changeStream = todoCollection.watch();
    // console.log(changeStream)
    //the 'on' signifies the event will be called every time that it occurred
    changeStream.on("change", (change)=>{
        // console.log(`change `, change)
        if(change.operationType === "insert"){
            const item = change.fullDocument;
            console.log(`item `, item)
            pusher.trigger("todos", "inserted", {
                todos: item.todos
            });
        }
    })

})




app.get("/items/get", (req, res)=>{
    // res.send("dcxs")
    const data = todomodel.find().then((data)=>{
        res.send(data);
    }).catch((err)=>{
        res.send(`error: ${err}`);
    })
    console.log(data);
})

app.post("/items/post", (req, res)=>{
    console.log(`req body` , req.body);
    const todo = new todomodel(req.body);
    todo.save().then(()=>{
        res.send(todo);
    }).catch((err)=>{
        res.send(err);
    })
    // res.send("xax")
})


app.patch('/items/update/:id' , (req, res) => {
    const id = req.params.id;
    console.log(req.body);
    todomodel.findByIdAndUpdate(id, { $set:
        {
            todos: req.body.todos
        }
    },
    {new : true}).then((data) => {
        res.send(`updated: ${data}`);
    })
    .catch((err) => {
        res.send(`error: ${err}`);
    })
})






app.delete("/items/delete/:id" , async(req, res) => {
    const id = req.params.id;

    todomodel.findByIdAndDelete(id)
    .then((data) => {
        res.send(`deleted: ${data}`);
    })
    .catch((err) => {
        res.send(`error: ${err}`);
    })
    

})




if(process.env.NODE_ENV === 'production'){
    const path = require('path');
    app.get('/', (req, res)=>{
        app.use(express.static('client/build'));
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
})

