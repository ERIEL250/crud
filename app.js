const path = require('path');
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
 
const bcrypt = require('bcrypt')

const connection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'crud'
});

connection.connect(function(error){
    if(!!error) console.log(error);
    else console.log('Database Connected!');
}); 

//set views file
app.set('views',path.join(__dirname,'views'));
			
//set view engine
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/',(req, res) => {
  res.sendFile(__dirname+'/views/home.html');
});
app.get('/add',(req, res) => {
    res.render('user_add', {
        title : 'student crud'
    });
});

app.post('/save',(req, res) => { 
    let data = {username: req.body.name, email: req.body.email};
    let sql = "INSERT INTO user SET ?";
    let query = connection.query(sql, data,(err, results) => {
      if(err) throw err;
      let sql = "SELECT * FROM user";
       let query = connection.query(sql, (err, rows) => {
           if(err) throw err;
           res.render('user_index', {
               title : 'student crud',
               user : rows
           });
       });
    });
});
app.get('/edit/:userId',(req, res) => {
    const userId = req.params.userId;
    let sql = `Select * from user where id = ${userId}`;
    let query = connection.query(sql,(err, result) => {
        if(err) throw err;
       
           res.render('user_edit', {
               title : 'student crud',
               user : result[0]
           });
      // });
    });
});
app.post('/update',(req, res) => {
    const userId = req.body.id;
    let sql = "update user SET username='"+req.body.name+"',  email='"+req.body.email+"' where id ="+userId;
    let query = connection.query(sql,(err, results) => {
      if(err) throw err;
      //let sql = "SELECT * FROM users";
       //let query = connection.query(sql, (err, rows) => {
         //  if(err) throw err;
          res.redirect('/'
              // title : 'student crud',
               //users : rows
           //});
       //}
      );
    });
});
app.get('/delete/:userId',(req, res) => {
    const userId = req.params.userId;
    let sql = `DELETE from user where id = ${userId}`;
    let query = connection.query(sql,(err, rows) => {
        if(err) throw err;
     
            res.redirect('/afdel')
         
    });
});
// Database connection setup
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "test"
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to the database');
  }
});
app.use(express.static('public'))
app.get('/register', (req, res) => {
  res.sendFile(__dirname+'/views/index.html');
});
app.get('/afdel', (req, res) => {
  let sql = "SELECT * FROM user";
  let query = connection.query(sql, (err, rows) => {
      if(err) throw err;
      res.render('user_index', {
          title : 'student crud',
          user: rows
      });
  });
});

app.post('/add', async(req, res) => {
 
  try {
    
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
   
    const name= req.body.name;
  
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
  db.query(sql, [name, hashedPassword], (err, result) => {
    if (err) {
      console.error('Error inserting data into database:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Data inserted successfully');
      let sql = "SELECT * FROM user";
       let query = connection.query(sql, (err, rows) => {
           if(err) throw err;
           res.render('user_index', {
               title : 'student crud',
               user: rows
           });
       });
    }
  });
  }
  catch {
    res.status(500).send()
  } 
});
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/views/login.html');
});
app.post('/login', async (req, res) => {
  try {
    const name = req.body.name;
    const password = req.body.password;

    const selectUserSql = 'SELECT * FROM users WHERE username = ?';
    db.query(selectUserSql, [name], async (err, result) => {
      if (err) {
        console.error('Error querying database:', err);
        return res.status(500).send('Internal Server Error');
      }

      const user = result[0];

      if (!user) {
        return res.status(400).send('Cannot find user');
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
       // res.send('Success');

       let sql = "SELECT * FROM user";
       let query = connection.query(sql, (err, rows) => {
           if(err) throw err;
           res.render('user_index', {
               title : 'student crud',
               user : rows
           });
       });
      } else {
        res.sendFile(__dirname + '/views/home.html');
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});
// Server Listening
app.listen(3000, () => {
    console.log('Server is running at port 3000');
});