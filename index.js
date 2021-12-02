const express = require('express');

const app = express();
const endpoint = "/notes";
var cors = require('cors')

var { getBrasileiraoTable, getBrasileiraoRodada, getTeams } = require("./controllers/brasileirao");
var { getFase } = require("./controllers/copa_do_brasil");


app.use(endpoint, express.json());
app.use("/database", express.json());


app.use(cors())

/*
  Stream
*/

let SERVER_INFORMATION = 'server_information';

var server = require('http').createServer(app);
var io = require('socket.io')(server);
server.listen(process.env.PORT || 3000);

function notify(id, title, name, last_name, email, team, birthday, city, state, password){
    console.log(title);
    io.sockets.emit(SERVER_INFORMATION,
		    {
			"id" : id,
			"name" : name,
			"last_name" : last_name,
            "email": email,
            "team": team,
            "birthday": birthday,
            "city": city,
            "state": state,
            "password": password
		    }
		   );
}

/*
 Parte do MongoDB
*/

const mongodb = require('mongodb')
const ObjectId = mongodb.ObjectId;
const password = "admin";
const connectionString = `mongodb://admin:${password}@cluster0-shard-00-00.r16gy.mongodb.net:27017,cluster0-shard-00-01.r16gy.mongodb.net:27017,cluster0-shard-00-02.r16gy.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-qdtyc0-shard-0&authSource=admin&retryWrites=true&w=majority`;

const options = { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}



async function connectToMongoDB(){
    const client = await mongodb.MongoClient.connect(connectionString, options);


    const db = await client.db('myFirstDatabase');

    const mensagens = await db.collection('users');    

    console.log(await mensagens.find({}).toArray());

    const endpoint = "/database";


    /*
      Rotas
    */
    app.get(endpoint, async  (req, res) => {
        res.send(await mensagens.find({}).toArray());
    });
    
    app.get(`${endpoint}/:id`, async (req, res) => {
        const id = req.params.id;
        const user = await mensagens.findOne({
            _id: ObjectId(id)
        });
    
        if (user) {
        res.send(user);
        } else {
        res.send("{}");
        }
    });

    app.post(endpoint, async (req, res) => {
        const user = {
			name : req.body["name"],
			last_name : req.body["last_name"],
            email: req.body["email"],
            team: req.body["team"],
            birthday: req.body["birthday"],
            city: req.body["city"],
            state: req.body["state"],
            password: req.body["password"]
        }
        const id = await mensagens.insertOne(user);
        res.send('1');

        notify(
            id.insertedId.toString(),
            user["name"], 
            user["last_name"], 
            user["email"], 
            user["team"], 
            user["birthday"], 
            user["city"], 
            user["state"],
            user["password"]
        );
    });
    
    
    app.put(`${endpoint}/:id`, async (req, res) => {
    
        const id = req.params.id;
        const user = {
			name : req.body["name"],
			last_name : req.body["last_name"],
            email: req.body["email"],
            team: req.body["team"],
            birthday: req.body["birthday"],
            city: req.body["city"],
            state: req.body["state"],
            password: req.body["password"]
        }

        await mensagens.updateOne({_id : ObjectId(id)},
            {$set: user}
        );
    
        res.send("1");
        notify(
            id.insertedId.toString(),
            user["name"], 
            user["last_name"], 
            user["email"], 
            user["team"], 
            user["birthday"], 
            user["city"], 
            user["state"],
            user["password"]
        );
    });
    
    app.delete(`${endpoint}/:id`, async (req, res) => {
        const id = req.params.id;
        console.log(id);
        await mensagens.deleteOne({_id : ObjectId(id)});
        res.send('1');
    
        notify(id, "", "", "", "", "", "", "","");
    }); 

}

app.get("/brasileirao/tabela", async (req, res) =>{
    var j = await getBrasileiraoTable();
    res.send(j.data);
})

app.get("/brasileirao/rodadas/:rodada/:id", async (req, res) => {
    var j = await getBrasileiraoRodada(req.params.rodada, req.params.id)
    res.send(j)
})

app.get("/copaBrasil/fases/:fase/:id", async (req, res) => {
    var j = await getFase(req.params.fase, req.params.id)
    res.send(j)
})

app.get("/teams", async (req, res) => {
    res.send({times: await getTeams()});
})
connectToMongoDB();

/*
 Tentando se conectar ao servidor
const { MongoClient } = require('mongodb');
const client = new MongoClient(uri, );
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});
*/