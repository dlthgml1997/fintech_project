const express = require("express");
const app = express();
const path = require("path");
const request = require("request");
const jwt = require("jsonwebtoken");
const auth = require("./lib/auth");
var mysql = require("mysql");
const { get } = require("request");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password12#",
  database: "fintech",
  port: "3306",
});

connection.connect();

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public"))); //to use static asset

app.get("/", function (req, res) {
  res.send("Hello World");
});

app.get("/ejsTest", function (req, res) {
  res.render("test");
});

app.get("/designTest", function (req, res) {
  res.render("design");
});

app.get("/signup", function (req, res) {
  res.render("signup");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/authTest", auth, function (req, res) {
  res.json("로그인이 완료된 사용자가 보는 화면");
});

app.get("/main", function (req, res) {
  res.render("main");
});

app.get("/addRouter", function (req, res) {
  console.log("router working");
  res.send("<html><h1>안녕하세요 html 코드입니다. </h1></html>");
});

app.get("/balance", function (req, res) {
  res.render("balance");
});

app.get("/qrcode", function (req, res) {
  res.render("qrcode");
});

app.get("/qrreader", function (req,res) {
  res.render("qrreader");
});
// ====== post =======

app.post("/signup", function (req, res) {
  console.log(req.body);
  var userName = req.body.userName;
  var userPassword = req.body.userPassword;
  var userEmail = req.body.userEmail;
  var userAccessToken = req.body.userAccessToken;
  var userRefreshToken = req.body.userRefreshToken;
  var userSeqNo = req.body.userSeqNo;

  var sql =
    "INSERT INTO user (`name`, `email`, `password`, `accesstoken`, `refreshtoken`, `userseqno`) VALUES (?, ?, ?, ?, ?, ?)";
  connection.query(
    sql,
    [
      userName,
      userEmail,
      userPassword,
      userAccessToken,
      userRefreshToken,
      userSeqNo,
    ],
    function (error, results) {
      if (error) throw error;
      else {
        res.json(1);
      }
    }
  );
});

app.post("/login", function (req, res) {
  console.log(req.body);
  var userEmail = req.body.userEmail;
  var userPassword = req.body.userPassword;
  var sql = "SELECT * FROM user WHERE email = ?";
  connection.query(sql, [userEmail], function (error, results) {
    if (error) throw error;
    else {
      if (results.length == 0) {
        res.json("등록되지 않은 회원입니다.");
      } else {
        var dbPassword = results[0].password;
        console.log("db 에서 가져온 패스워드", dbPassword);
        if (userPassword == dbPassword) {
          var tokenKey = "f@i#n%tne#ckfhlafkd0102test!@#%";
          jwt.sign(
            {
              userId: results[0].id,
              userEmail: results[0].email,
            },
            tokenKey,
            {
              expiresIn: "10d",
              issuer: "fintech.admin",
              subject: "user.login.info",
            },
            function (err, token) {
              console.log("로그인 성공", token);
              res.json(token);
            }
          );
        } else {
          res.json("비밀번호가 다릅니다");
        }
      }
    }
  });
});

app.get("/authResult", function (req, res) {
  var authCode = req.query.code;
  console.log("사용자 인증코드 : ", authCode);
  var option = {
    method: "POST",
    url: "https://testapi.openbanking.or.kr/oauth/2.0/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
    form: {
      code: authCode,
      //#자기 키로 시크릿 변경
      client_id: "SM2eOU4s0ouUvvcvkIA5pBgfOVcF7VCzSs7qWKo7",
      client_secret: "8rKpNTyQCJGeLNlGPULF2e0IAgU7Pem5wBfpeh0A",
      redirect_uri: "http://localhost:3000/authResult",
      grant_type: "authorization_code",
    },
  };
  request(option, function (error, response, body) {
    if (error) {
      console.error(error);
      throw error;
    } else {
      var accessRequestResult = JSON.parse(body);
      console.log(accessRequestResult);
      res.render("resultChild", { data: accessRequestResult });
    }
  });
});

app.post("/list", auth, function (req, res) {
  var userId = req.decoded.userId;

  var sql = "SELECT * FROM user WHERE id = ?";
  connection.query(sql, [userId], function (error, results) {
    if (error) {
      console.error(error);
      throw error;
    } else {
      console.log(results[0]);
      var option = {
        method: "GET",
        url: "https://testapi.openbanking.or.kr/v2.0/user/me",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Bearer " + results[0].accesstoken,
        },
        qs: {
          user_seq_no: results[0].userseqno,
        },
      };
      request(option, function (error, response, body) {
        if (error) {
          console.error(error);
          throw error;
        } else {
          var resultJson = JSON.parse(body);
          console.log(resultJson);
          res.json(resultJson);
        }
      });
    }
  });
});

app.post("/ajaxTest", function (req, res) {
  var userId = req.body.sendUserId;
  var userPassword = req.body.sendUserPassword;
  console.log("요청 바디 :", req.body);
  console.log("사용자 아이디는 :", userId);
  console.log("사용자 password :", userPassword);

  res.json("로그인에 성공하셨습니다.");
});

app.post("/balance", auth, function (req, res) {
  var userId = req.decoded.userId; 
  var fin_use_num = req.body.fin_use_num;
  var countnum = Math.floor(Math.random() * 1000000000) + 1;
  var transId = "T991641600U" + countnum; //이용기과번호 

  var sql = "SELECT * FROM user WHERE id = ?"; 
  connection.query(sql, [userId], function(err, results){
    if(err) {
      console.log(err);
      throw err;
    } else {
      console.log("밸런스 받아온 데이터 베이스 값 : ", results);
      var option = {
        method: "GET",
        url: "https://testapi.openbanking.or.kr/v2.0/account/balance/fin_num",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Bearer "+ results[0].accesstoken,
        },
        qs: {
          bank_tran_id: transId,
          fintech_use_num: fin_use_num,
          tran_dtime: "20190910101921",
        },
      };
      request(option, function (error, response, body) {
        if (error) {
          console.error(error);
          throw error;
        } else {
          var balanceResult = JSON.parse(body);
          console.log(balanceResult);
          res.json(balanceResult);
        }
      });
    }
  });
});

app.post("/transactionList", auth, function(req, res){
  var userId = req.decoded.userId; 
  var fin_use_num = req.body.fin_use_num;
  var countnum = Math.floor(Math.random() * 1000000000) + 1;
  var transId = "T991641600U" + countnum; //이용기관번호 

  var sql = "SELECT * FROM user WHERE id = ?"; 
  connection.query(sql, [userId], function(err, results){
    if(err) {
      console.log(err);
      throw err;
    } else {
      console.log("밸런스 받아온 데이터 베이스 값 : ", results);
      var option = {
        method: "GET",
        url: "https://testapi.openbanking.or.kr/v2.0/account/transaction_list/fin_num",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Bearer "+ results[0].accesstoken,
        },
        qs: {
          bank_tran_id: transId,
          fintech_use_num: fin_use_num,
          inquiry_type: "A",
          inquiry_base: "D",
          from_date: "20190101",
          to_date: "20190101",
          sort_order: "D",
          tran_dtime: "20190910101921",
        },
      };
      request(option, function (error, response, body) {
        if (error) {
          console.error(error);
          throw error;
        } else {
          var transactionResult = JSON.parse(body);
          console.log(transactionResult);
          res.json(transactionResult);
        }
      });
    }
  });
});

app.post("/withdraw", auth, function (req,res) {
  // 출금 이체 request 요청 만들기
  var userId = req.decoded.userId; 
  var fin_use_num = req.body.fin_use_num;
  var to_fin_use_num = req.body.to_fin_use_num;
  var amount = req.body.amount;
  console.log(
    "유저 아이디, 출금 핀테크번호, 입금 핀테크번호, 금액 : ",
    userId,
    fin_use_num,
    to_fin_use_num,
    amount);

  var countnum = Math.floor(Math.random() * 1000000000) + 1;
  var transId = "T991641600U" + countnum; //이용기관번호 

  var sql = "SELECT * FROM user WHERE id = ?"; 
  connection.query(sql, [userId], function(err, results){
    if(err) {
      console.log(err);
      throw err;
    } else {
      var option = {
        method: "POST",
        url: "https://testapi.openbanking.or.kr/v2.0/transfer/withdraw/fin_num",
        headers: {
          Authorization: "Bearer "+ results[0].accesstoken,
          "Content-Type": "application/json",
        },
        json: {
          bank_tran_id: transId,
          cntr_account_type: "N",
          cntr_account_num: "0811129497", 
          dps_print_content: "쇼핑몰환불", 
          fintech_use_num: fin_use_num, 
          wd_print_content: "오픈뱅킹출금",
          tran_amt: "1000",
          tran_dtime: "20190910101921", 
          req_client_name: "홍길동", 
          req_client_fintech_use_num: fin_use_num,
          transfer_purpose: "ST",
          req_client_num: "LEESOHEE1234",
          sub_frnc_business_num: "0811129497",
          recv_client_name: "이소희", 
          recv_client_bank_code: "037", 
          recv_client_account_num: "0811129497"
          },
      };
      request(option, function (error, response, body) {
        var countnum2 = Math.floor(Math.random() * 1000000000) + 1;
        var transId2 = "T991641600U" + countnum2; //이용기관번호 
      
        // 입금이체 요청 만들기
        var option = {
          method: "POST",
          url: " https://testapi.openbanking.or.kr/v2.0/transfer/deposit/fin_num",
          headers: {
            Authorization: "Bearer "+ 
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJUOTkxNjQxNjAwIiwic2NvcGUiOlsib29iIl0sImlzcyI6Imh0dHBzOi8vd3d3Lm9wZW5iYW5raW5nLm9yLmtyIiwiZXhwIjoxNjAzMDg2MDgxLCJqdGkiOiJjOWU5N2NmZC03MTdlLTQ3ZDUtYjQ0ZC0yODIxYTRhYzQ1OWEifQ.KsumgA7nBRf8cJV0pyI44cBCFuxc6pRvE0KDudmR1nw",
            "Content-Type": "application/json",
          },
          json: {            
            "cntr_account_type": "N",
            "cntr_account_num": "8388421099",
            "wd_pass_phrase": "NONE",
            "wd_print_content": "환불금액",
            "name_check_option": "on",
            "tran_dtime": "20190910101921",
            "req_cnt": "1",
            "req_list": [
              {
                "tran_no": "1",
                "bank_tran_id": transId2,
                "fintech_use_num": to_fin_use_num,
                "print_content": "오픈서비스캐시백",
                "tran_amt": "500",
                "req_client_name": "홍길동",
                "req_client_bank_code": "037", 
                "req_client_account_num": "0811129497",
                "req_client_num": "LEESOHEE1234",
                "transfer_purpose": "TR"
              }
            ]
          },
        };
        request(option, function (error, response, body) {
          console.log(body);
        });  
      });
    }
  });
});

app.listen(3000);
