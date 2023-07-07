import express from 'express';
import fs from 'node:fs';
import path from 'node:path';

const app = express();
const port = 3000;

const folderPath = path.resolve(process.cwd(), 'files');

app.get('/files', (req, res) => {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error(`Error while reading directory: `, err);
      return res.status(500).json({ error: `Server error.` });
    }

    const fileDetails = files.map((file) => {
      const filePath = path.join(folderPath, file);
      const fileStats = fs.statSync(filePath);
      const fileSize = fileStats.size;

      return {
        name: file,
        size: fileSize,
        extension: path.extname(file),
      };
    });
    res.json(fileDetails);
  });
});

app.listen(port, () => {
  console.log(`Server launched on port: ${port}`);
});
