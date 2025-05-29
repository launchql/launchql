import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

interface User {
  id: number;
  name: string;
  email: string;
}

const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
];

app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Function is running');
});

app.get('/users', (req: Request, res: Response) => {
  res.status(200).json(users);
});

app.post('/users', (req: Request, res: Response) => {
  try {
    const { filter } = req.body as { filter?: string };
    
    if (filter) {
      const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(filter.toLowerCase()) || 
        user.email.toLowerCase().includes(filter.toLowerCase())
      );
      
      return res.status(200).json({
        success: true,
        data: filteredUsers,
        count: filteredUsers.length,
        timestamp: new Date().toISOString()
      });
    }
    
    return res.status(200).json({
      success: true,
      data: users,
      count: users.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
