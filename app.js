var sname="";
var sid=0;
const https = require("https");
const express= require("express");
const mysql=require("mysql");
const session = require('express-session');
const bodyParser = require("body-parser");
// const fetch = require("node-fetch");
const ejs = require("ejs");
const app=express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Saikat1234",
  database: "schooldb"
});
con.connect(function(err){
  if(err) throw err;
  console.log("Connected to Database!")
});

app.get('/', function(req,res){
  res.render("login");
});
app.get('/loginf',function(req,res){
	res.render("loginf");
});
app.post('/auth',function(req,res){
  var pwd=req.body.pwd;
  var uname=req.body.uname;
  var sql="select id,uname from admin where uname='"+uname+"' and password='"+pwd+"';";
  con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    if(result.length>0){
      req.session.loggedin=true;
      req.session.username=result[0].uname;
      res.redirect("/control");
    }else{
      res.redirect("/loginf");
    }
  });
});
app.get('/logout',function(req,res){
  req.session.loggedin=false;
  res.redirect("/");
});
app.get('/control',function(req,res){
  if(req.session.loggedin){
    console.log(req.session.username);
    res.render("control",{name:req.session.username});
  }
  else{
    res.render("controlf");
  }
});

app.get('/nu',function(req,res){
	if(req.session.loggedin){
    console.log(req.session.username);
    res.render('nu');
  }
  else{
    res.redirect("/control");
  }

});

app.post('/nu',function(req,res){
  var uname=req.body.uname;
  var pwd=req.body.password;
  var fname=req.body.fname;
  var mail=req.body.mailid;
  var sql1="select id from admin where uname = '"+uname+"';"
  con.query(sql1,function(err,result, fields){
    if(err) throw err;
    if(result.length>0){
      res.render('nuf');
    }else{
      var sql2="insert into admin (uname,password,fname,email) values ('"+uname+"','"+pwd+"','"+fname+"','"+mail+"');"
      con.query(sql2,function(err,result){
        if (err) throw err;
        console.log('Record Inserted.');
        res.redirect("/");
      });
    }
  });
});

app.get('/dbms',function(req,res){
	if(req.session.loggedin){
    res.render("dbmshome",{name:req.session.username});
  }
  else{
    res.redirect("/control");
  }
});

app.get('/ns', function(req,res){
	if(req.session.loggedin){
    res.render("ns",{name:req.session.username});
  }
  else{
    res.redirect("/control");
  }
});

app.post('/ns',function(req,res){
	rid=req.body.rid;
	rname=req.body.nname;
	var sql1 = "select * from studentdb where sid = '"+rid+"';";
	con.query(sql1,function(err,result){
		if(err) throw err;
		if(result.length>0){
			res.render('nsf',{name:req.session.username,rname:result[0].name});
		}else{
			var sql = "insert into studentdb (sid,name) values ('"+rid+"', '"+rname+"');";
			con.query(sql,function(err,result){
				if(err) throw err;
				var sql2 = "select * from studentdb where sid = '"+rid+"';";
				con.query(sql2,function(err,result){
					if(err) throw err;
					res.render('nss',{name:req.session.username,rid:result[0].sid,rname:result[0].name});
				});
			});
		}
	});
});

app.get('/uc',function(req,res){
	if(req.session.loggedin){
    res.render("uc",{name:req.session.username});
  }
  else{
    res.redirect("/control");
  }
});

app.post('/uc',function(req,res){
	var sql1 = "select pid from pricing where class='"+req.body.class+"' and lang = '"+req.body.lang+"';";
	con.query(sql1,function(err,result){
		if(err) throw err;
		var pid = result[0].pid;
		var sql2 = "UPDATE `pricing` SET `bookprice` = '"+req.body.ubc+"', `copyprice` = '"+req.body.ucc+"' WHERE (`pid` = '"+pid+"');"
		con.query(sql2,function(err,result){
			if(err) throw err;
			res.render('ucs',{name:req.session.username,ubc:req.body.ubc,ucc:req.body.ucc,uclass:req.body.class,lang:req.body.lang});
		});
	});
});

app.get('/control/bu',function(req,res){
  if(req.session.loggedin){
    res.render("bu",{name:req.session.username});
  }
  else{
    res.redirect("/control");
  }
});

app.get('/control/buf',function(req,res){
	if(req.session.loggedin){
    res.render("buf",{name:req.session.username});
  }
  else{
    res.redirect("/control");
  }
});

app.get('/manuser',function(req,res){
	if(req.session.loggedin){
    res.render("manuser",{name:req.session.username});
  }
  else{
    res.redirect("/control");
  }
});

app.post('/post-uid',function(req,res){
	var uid=req.body.uid;
	var sql="select sid,name from studentdb where sid='"+uid+"';";
	con.query(sql,function(err,result,fields){
		var uname=req.session.username;
		if(result.length>0){
			sname=result[0].name;
			sid=result[0].sid;
			res.render('utility',{sname:sname,sid:sid,uname:uname});
		}else{
			res.redirect('/control/buf');
		}

	});
});
app.post('/post-uid-manuser',function(req,res){
	sname=req.body.stname;
	sid='Not yet registered';
	uname=req.session.username;
	res.render('utility',{sname:sname,sid:sid,uname:uname});
});
app.post('/submit',function(req,res){
	var student_name=sname;
	var student_id=sid;
	var i_class = req.body.class;
	var i_lang=req.body.lang;
	var i_po=req.body.po;
	var total_cost=0.00;
	var bcost=0.00;
	var ccost=0.00;
	var bq=0;
	var cq=0;
	var dis=parseInt(req.body.dis);
	var lang="";
	if(i_lang=='beng'){
		language="Bengali";
	}else{
		language="Hindi";
	}
	var sql="select * from pricing where class='"+i_class+"' and lang='"+i_lang+"';";
	con.query(sql,function(err,result){
		if (err) throw err;
		bcost=parseFloat(result[0].bookprice);
		ccost=parseFloat(result[0].copyprice);
		if(i_po=='b'){
			bq=1;
			total_cost=bcost;
		}else if(i_po=='c'){
			cq=1;
			total_cost=ccost;
		}else{
			bq=1;
			cq=1;
			total_cost=bcost+ccost;
		}
		bcost=parseFloat(bcost).toFixed(2);
		ccost=parseFloat(ccost).toFixed(2);
		var dis_amt=(total_cost*(dis/100));
		var total_payable = total_cost-(total_cost*(dis/100));
		total_cost=parseFloat(total_cost).toFixed(2);
		total_payable=parseFloat(total_payable).toFixed(2);
		var date=new Date();
		date=date.toISOString().slice(0,10);
		if(i_lang=='beng'){
			i_lang="Bengali";
		}else{
			i_lang="Hindi";
		}
		var sql1='INSERT INTO invoices (`date`,`admin`, `name`, `studentid`, `class`, `lang`,`bquant`, `cquant`, `bcost`, `ccost`, `subtotal`, `discount`, `dis_amt`, `total`) VALUES ("'+date+'", "'+req.session.username+'", "'+student_name+'", "'+student_id+'", "'+i_class+'", "'+i_lang+'", "'+bq+'", "'+cq+'", "'+bcost+'", "'+ccost+'", "'+total_cost+'", "'+dis+'", "'+dis_amt+'", "'+total_payable+'");';
		con.query(sql1,function(err,result){
			if (err) throw err;
			console.log("Invoice Inserted!");
		});
		var sql2 = "select id from invoices where studentid = '"+student_id+"' order by id desc limit 1;";
		var iid=0;
		con.query(sql2,function(err,result){
			if(err) throw err;
			iid=result[0].id;
			console.log(result);
			var sql3 = "select * from invoices where id="+iid+";";
			con.query(sql3,function(err,out){
				if(err) throw err;
				console.log(out);
				res.render('final',{items:out});
				// res.render('final',{iid:iid,uname:req.session.username,sname:student_name,sid:student_id,
				// 	bcost:bcost,ccost:ccost,bq:bq,cq:cq,tcost:total_cost,dis:dis,disamnt:dis_amt,tp:total_payable,date:date,sclass:i_class,lang:language});
			});
		});
	});
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function (){
  console.log("Server has started successfully.");
});
