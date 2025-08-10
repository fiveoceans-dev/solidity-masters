const fs = require('fs');
const path = require('path');
const { Client } = require('pg'); // PostgreSQL client

// Use Supabase connection string when available so the problem loader works in
// Supabase-hosted environments. Falls back to DATABASE_URL for compatibility
// with local setups.
const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

const dbClient = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});
dbClient.connect();

const dataFolderPath = path.join(__dirname, '../data');

// Create schema
async function createSchema() {
  const query = `
    CREATE TABLE IF NOT EXISTS problems (
      id SERIAL PRIMARY KEY,
      title TEXT UNIQUE NOT NULL,
      status TEXT,
      topics JSONB,
      companies JSONB,
      description TEXT,
      examples JSONB,
      constraints JSONB,
      follow_up TEXT,
      hints JSONB,
      solidity_template TEXT,
      sol_file TEXT,
      t_sol_file TEXT
    );
  `;
  await dbClient.query(query);
}

// Insert or update a problem in the database
async function loadProblemInDB(problemData) {
    const query = `
      INSERT INTO problems (title, status, topics, companies, description, examples, constraints, follow_up, hints, solidity_template, sol_file, t_sol_file)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (title) 
      DO UPDATE SET
        status = EXCLUDED.status,
        topics = EXCLUDED.topics,
        companies = EXCLUDED.companies,
        description = EXCLUDED.description,
        examples = EXCLUDED.examples,
        constraints = EXCLUDED.constraints,
        follow_up = EXCLUDED.follow_up,
        hints = EXCLUDED.hints,
        solidity_template = EXCLUDED.solidity_template,
        sol_file = EXCLUDED.sol_file,
        t_sol_file = EXCLUDED.t_sol_file;
    `;
  
    await dbClient.query(query, [
      problemData.title,
      problemData.status,
      JSON.stringify(problemData.topics),
      JSON.stringify(problemData.companies),
      problemData.description,
      JSON.stringify(problemData.examples),
      JSON.stringify(problemData.constraints),
      problemData.follow_up,
      JSON.stringify(problemData.hints),
      problemData.solidity_template,
      problemData.sol_file,
      problemData.t_sol_file,
    ]);
  }
  

// Process files and load them into the database
async function loadProblemsFromFiles() {
    const files = fs.readdirSync(dataFolderPath);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
  
    for (const jsonFile of jsonFiles) {
      const baseName = jsonFile.replace('.json', '');
      const solFile = path.join(dataFolderPath, `${baseName}.sol`);
      const tSolFile = path.join(dataFolderPath, `${baseName}.t.sol`);
      
      if (fs.existsSync(solFile) && fs.existsSync(tSolFile)) {
        const jsonData = JSON.parse(fs.readFileSync(path.join(dataFolderPath, jsonFile), 'utf-8'));
        
        // Assuming jsonData has a 'problems' array
        const problemData = jsonData.problems[0];  // Access the first problem from the array
  
        const problem = {
          title: problemData.title,
          status: problemData.status,
          topics: problemData.topics,
          companies: problemData.companies,
          description: problemData.description,
          examples: problemData.examples,
          constraints: problemData.constraints,
          follow_up: problemData.follow_up,
          hints: problemData.hints,
          solidity_template: problemData.solidity_template ? problemData.solidity_template.code : '',
          sol_file: solFile,
          t_sol_file: tSolFile,
        };
  
        await loadProblemInDB(problem);
      }
    }
  }
  

// Main function to update problems
async function updateProblems() {
  try {
    await createSchema();
    await loadProblemsFromFiles();
    console.log('Problems loaded successfully.');
  } catch (err) {
    console.error('Error updating problems:', err);
    throw err;
  }
}

module.exports = updateProblems;
