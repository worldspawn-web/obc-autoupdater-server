import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const app = express();
const port = 3000;

app.use(express.json());

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

app.post('/files', (req, res) => {
  const { clientFiles } = req.body;
  const mismatchedFiles = [];

  clientFiles.forEach((filename) => {
    if (filename.endsWith('.scs')) {
      const serverFilepath = path.join(folderPath, filename);
      const clientFilepath = path.join(folderPath, filename);

      if (fs.existsSync(serverFilepath) && fs.existsSync(clientFilepath)) {
        const serverFileContent = fs.readFileSync(serverFilepath);
        const clientFileContent = fs.readFileSync(clientFilepath);

        const serverFileHash = crypto
          .createHash('md5')
          .update(serverFileContent)
          .digest('hex');
        const clientFileHash = crypto
          .createHash('md5')
          .update(clientFileContent)
          .digest('hex');

        if (serverFileHash !== clientFileHash) {
          mismatchedFiles.push(filename);
        }
      }
    }
  });

  if (mismatchedFiles.length > 0) {
    res.json({ mismatchedFiles });
  } else {
    res.json({ message: 'Files are up to date.' });
  }
});

app.listen(port, () => {
  console.log(`Server launched on port: ${port}`);
});
