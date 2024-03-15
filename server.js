const express = require("express");
const mysql = require("mysql");

// Crear un pool de conexiones a la base de datos
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "Temporal2021+",
  database: "persona",
});

// Establecer la conexión a la base de datos
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error al conectar a la base de datos: ", err);
    return;
  }
  console.log("Conexión exitosa a la base de datos");

  const createTableSql = `
      CREATE TABLE IF NOT EXISTS deliveries (
        delivery_id INT AUTO_INCREMENT PRIMARY KEY,
        recipient_address VARCHAR(255),
        recipient_name VARCHAR(255),
        sender_phone_number VARCHAR(20),
        sender_name VARCHAR(255),
        package_weight DECIMAL(10, 2),
        creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

  connection.query(createTableSql, (err, results) => {
    if (err) {
      console.error("Error al crear la tabla: ", err);
      return;
    }
    console.log("Tabla 'deliveries' creada con éxito");
  });

  connection.release(); // Liberar la conexión
});

// Crear una instancia de la aplicación Express
const app = express();

// Habilita el cuerpo de la solicitud para que se pueda leer en JSON
app.use(express.json());

app.post("/deliveries", (req, res) => {
  const {
    recipient_address,
    recipient_name,
    sender_phone_number,
    sender_name,
    package_weight,
  } = req.body;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error al conectar a la base de datos: ", err);
      return res.status(500).send("Error al conectar a la base de datos");
    }

    const insertSql = `
      INSERT INTO deliveries (recipient_address, recipient_name, sender_phone_number, sender_name, package_weight)
      VALUES (?, ?, ?, ?, ?)
    `;

    connection.query(
      insertSql,
      [
        recipient_address,
        recipient_name,
        sender_phone_number,
        sender_name,
        package_weight,
      ],
      (err, results) => {
        connection.release();

        if (err) {
          console.error("Error al insertar el envío: ", err);
          return res.status(500).send("Error al insertar el envío");
        }

        res.send({ id: results.insertId, message: "Envío creado con éxito" });
      }
    );
  });
});

app.get("/deliveries", (req, res) => {
  const { fecha1, fecha2 } = req.query;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error al conectar a la base de datos: ", err);
      return res.status(500).send("Error al conectar a la base de datos");
    }

    const selectSql = `
        SELECT * FROM deliveries 
        WHERE creation_date >= ? AND creation_date <= ?
      `;

    connection.query(selectSql, [fecha1, fecha2], (err, results) => {
      connection.release();

      if (err) {
        console.error("Error al obtener los envíos: ", err);
        return res.status(500).send("Error al obtener los envíos");
      }

      res.send(results);
    });
  });
});

app.get("/deliveries/all", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error al conectar a la base de datos: ", err);
      return res.status(500).send("Error al conectar a la base de datos");
    }

    const selectSql = "SELECT * FROM deliveries";

    connection.query(selectSql, (err, results) => {
      connection.release();

      if (err) {
        console.error("Error al obtener los envíos: ", err);
        return res.status(500).send("Error al obtener los envíos");
      }

      res.send(results);
    });
  });
});

app.delete("/deliveries/:delivery_id", (req, res) => {
  const { delivery_id } = req.params;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error al conectar a la base de datos: ", err);
      return res.status(500).send("Error al conectar a la base de datos");
    }

    const deleteSql = "DELETE FROM deliveries WHERE delivery_id = ?";

    connection.query(deleteSql, [delivery_id], (err, results) => {
      connection.release();

      if (err) {
        console.error("Error al eliminar el envío: ", err);
        return res.status(500).send("Error al eliminar el envío");
      }

      res.send({ message: "Envío eliminado con éxito" });
    });
  });
});

app.put("/deliveries/:delivery_id", (req, res) => {
  const { delivery_id } = req.params;
  const {
    recipient_address,
    recipient_name,
    sender_phone_number,
    sender_name,
    package_weight,
  } = req.body;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error al conectar a la base de datos: ", err);
      return res.status(500).send("Error al conectar a la base de datos");
    }

    const updateSql = `
        UPDATE deliveries 
        SET recipient_address = ?, recipient_name = ?, sender_phone_number = ?, sender_name = ?, package_weight = ?
        WHERE delivery_id = ?
      `;

    connection.query(
      updateSql,
      [
        recipient_address,
        recipient_name,
        sender_phone_number,
        sender_name,
        package_weight,
        delivery_id,
      ],
      (err, results) => {
        connection.release();

        if (err) {
          console.error("Error al actualizar el envío: ", err);
          return res.status(500).send("Error al actualizar el envío");
        }

        res.send({ message: "Envío actualizado con éxito" });
      }
    );
  });
});

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
  console.log("Servidor iniciado en el puerto 3000");
});
