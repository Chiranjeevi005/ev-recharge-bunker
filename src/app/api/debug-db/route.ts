import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function GET() {
  try {
    // Run a simple MongoDB command using the mongo shell
    const command = `mongo "${process.env.DATABASE_URL}" --eval "db.getSiblingDB('ev_bunker').getCollectionNames()"`;
    
    console.log('Running command:', command);
    const { stdout, stderr } = await execPromise(command);
    
    console.log('Command output:', stdout);
    console.log('Command error:', stderr);
    
    return NextResponse.json({
      stdout,
      stderr
    });
  } catch (error: any) {
    console.error("Error running debug command:", error);
    return NextResponse.json(
      { error: "Failed to run debug command", details: error.message }, 
      { status: 500 }
    );
  }
}