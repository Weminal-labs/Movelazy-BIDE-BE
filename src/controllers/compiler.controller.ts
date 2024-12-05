// src/controllers/compiler.controller.ts
import { Request, Response } from 'express';
import { compileCodeService } from '../services/compiler.service';
import * as fs from 'fs/promises';

export const compileCode = async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files.source?.[0] || !files.config?.[0]) {
      return res.status(400).json({
        error: 'Both source and config files are required'
      });
    }

    const moveFile = files.source[0];
    const tomlFile = files.config[0];

    const buildPath = await compileCodeService(moveFile.path, tomlFile.path);

    // Gửi file build về client
    res.download(buildPath, 'build.tar.gz', async (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Cleanup sau khi gửi file
      await fs.unlink(buildPath).catch(console.error);
    });

    // Cleanup input files
    await Promise.all([
      fs.unlink(moveFile.path),
      fs.unlink(tomlFile.path)
    ]);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
