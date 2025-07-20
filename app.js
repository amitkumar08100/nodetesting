const express = require('express');
const { json } = require('body-parser');

const { employees } = require('./employees');
const { departments } = require('./departments');

const app = express();
app.use(json());

// Fetch employees based on startIndex and limit
// Filter employees

app.get('/employees', (req, res) => {
  const obj = {};

  const { startIndex = 0, limit = 25, q, fields, sort } = req.query;

  // q: departmentId=1 and firstName = 'ABC' or lastName = 'XYZ'
  let filteredEmployees = [];
  if (q) {
    let query = `el.${q
      .replaceAll('and', '&&el.')
      .replaceAll('or', '||el.')
      .replaceAll('=', '===')
      .replaceAll('!=', '!==')
      .replaceAll(' ', '')}`;
    console.log(query);
    filteredEmployees = employees.filter((el) => eval(query));
  } else {
    filteredEmployees = employees;
  }

  obj.items = filteredEmployees.slice(startIndex, limit);

  if (fields) {
    obj.items = obj.items.map((el) => {
      const payload = {};
      for (const [key, value] of Object.entries(el)) {
        const fieldsArr = fields.split(',').map((el) => el.trim());

        if (fieldsArr.includes(key)) payload[key] = value;
      }

      return payload;
    });
  }

  //id=asc;
  if (sort) {
    const [key, value] = sort.split('=');
    obj.items.sort((a, b) =>
      value === 'asc' ? a[key] - b[key] : b[key] - a[key]
    );
  }

  obj.limit = limit;
  obj.startIndex = startIndex;
  obj.count = obj.items.length;
  obj.total = employees.length;
  obj.hasMore = filteredEmployees.length > limit;
  res.send(obj);
});

app.listen(3000, () => console.log('Listerning on port 3000'));
