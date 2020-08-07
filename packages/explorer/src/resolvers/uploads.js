import fs from 'fs';
import path from 'path';

const UPLOAD_DIR_NAME = 'uploads';

export default async function resolveUpload(upload, _args, _context, _info, tags) {

    console.log({tags})

    const { filename, createReadStream } = upload;
    const stream = createReadStream();
    // Save file to the local filesystem
    const { filepath } = await saveLocal({ stream, filename });
    // Return metadata to save it to Postgres
    return filepath;
}

function saveLocal({ stream, filename }) {
    const timestamp = new Date().toISOString().replace(/\D/g, '');
    const id = `${timestamp}_${filename}`;
    const filepath = path.join(UPLOAD_DIR_NAME, id);
    const fsPath = path.join(process.cwd(), filepath);
    return new Promise((resolve, reject) =>
        stream
            .on('error', (error) => {
                if (stream.truncated)
                    // Delete the truncated file
                    fs.unlinkSync(fsPath);
                reject(error);
            })
            .on('end', () => resolve({ id, filepath }))
            .pipe(fs.createWriteStream(fsPath))
    );
}
