var url = require('url');
var db = require('./db');
var template = require('./template.js');
var qs = require('querystring');

exports.home = function(request, response){
  db.query('SELECT * FROM topic', function(err, topics) {
    if (err) {
      throw err;
    }
    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = template.list(topics);
    var html = template.HTML(title, list,
      `<h2>${title}</h2>${description}`,
      `<a href="/create">create</a>`
    );
    response.writeHead(200);
    response.end(html);
  });
}

exports.page = function(request, response){
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  db.query(`SELECT * FROM topic`, function(error, topics) {
    if (error) {
      throw error;
    }
    db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id = author.id WHERE topic.id=?`, [queryData.id], function(error2, topic) {
      if (error2) {
        throw error2;
      }
      var title = topic[0].title;
      var description = topic[0].description;
      var list = template.list(topics);
      var html = template.HTML(title, list,
        `<h2>${title}</h2>${description}
        <p>by  ${topic[0].name}</p>`,
        ` <a href="/create">create</a>
        <a href="/update?id=${queryData.id}">update</a>
        <form action="delete_process" method="post">
          <input type="hidden" name="id" value="${queryData.id}">
          <input type="submit" value="delete">
        </form>`
      );
      response.writeHead(200);
      response.end(html);
    });
  });
}

exports.create = function(request, response){
  db.query('SELECT * FROM topic', function(err, topics) {
    if (err) {
      throw err;
    }
    db.query('SELECT * FROM author', function(err2, author) {
      if (err2) {
        throw err2;
      }
      var title = 'WEB - create'
      var list = template.list(topics);
      var html = template.HTML(title, list, `
         <form action="/create_process" method="post">
           <p><input type="text" name="title" placeholder="title"></p>
           <p>
             <textarea name="description" placeholder="description"></textarea>
           </p>
           <p>
            ${template.authorlist(author)}
           </p>
           <p>
             <input type="submit">
           </p>
         </form>
         `, '');
      response.writeHead(200);
      response.end(html);
    });
  });
}

exports.create_process = function(request, response){
  var body = '';
  request.on('data', function(data) {
    body = body + data;
  });
  request.on('end', function() {
    var post = qs.parse(body);
    db.query(`INSERT INTO topic (title, description, created, author_id)
        VALUE(?, ?, NOW(), ?)`, [post.title, post.description, post.author],
      function(err, result) {
        if (err) {
          throw err;
        }
        response.writeHead(302, {
          Location: `/?id=${result.insertId}`
        });
        response.end();
      });
  });
}

exports.update = function(request, response){
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  db.query('SELECT * FROM topic', function(err, topics) {
    if (err) {
      throw err;
    }
    db.query('SELECT * FROM topic WHERE id=?', [queryData.id], function(err2, topic) {
      if (err2) {
        throw err2;
      }
      db.query('SELECT * FROM author', function(err3, author) {
        var title = topic[0].title;
        var description = topic[0].description;
        var list = template.list(topics);
        var html = template.HTML(title, list,
          `
        <form action="/update_process" method="post">
        <input type="hidden" name="id" value="${queryData.id}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          <p>
           ${template.authorlist(author,topic[0].author_id)}
          </p>
          <p>
          <input type="submit">
          </p>
        </form>
      `,
          `<a href="/create">create</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
    });
  });
}


exports.update_process = function(request, response){
  var body = '';
  request.on('data', function(data) {
    body = body + data;
  });
  request.on('end', function() {
    var post = qs.parse(body);
    var id = post.id;
    var title = post.title;
    var description = post.description;
    db.query('UPDATE topic SET title=?, description=?, author_id=? WHERE id=?',
      [title, description, post.author, id],
      function(err, result) {
        if (err) {
          throw err;
        }
        response.writeHead(302, {
          Location: `/?id=${id}`
        });
        response.end();
      });
  });
}

exports.delete_process = function(request, response){
  var body = '';
  request.on('data', function(data) {
    body = body + data;
  });
  request.on('end', function() {
    var post = qs.parse(body);
    var id = post.id;
    db.query(`DELETE FROM topic WHERE id=?`, [id], function(err, result) {
      if (err) {
        throw err;
      }
      response.writeHead(302, {
        Location: `/`
      });
      response.end();
    });
  });
}
