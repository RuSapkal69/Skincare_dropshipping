import { schedule } from 'node-cron';
import { exec } from 'child_process';
import { join } from 'path';

// Schedule product refresh every 6 hours
// Cron format: minute hour day-of-month month day-of-week
// 0 */6 * * * = At minute 0 past every 6th hour
schedule('0 */6 * * *', () => {
  console.log('Running product refresh cron job...');
  
  const scriptPath = join(__dirname, 'refreshProducts.js');
  
  exec(`node ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing refresh script: ${error}`);
      return;
    }
    
    console.log(`Refresh script output: ${stdout}`);
    
    if (stderr) {
      console.error(`Refresh script errors: ${stderr}`);
    }
  });
});

console.log('Cron job scheduled to refresh products every 6 hours');