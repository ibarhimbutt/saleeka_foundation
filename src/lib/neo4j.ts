import neo4j, { Driver, Session, Transaction } from 'neo4j-driver';

// Neo4j Aura connection configuration
const NEO4J_URI = process.env.NEO4J_URI;
const NEO4J_USERNAME = process.env.NEO4J_USERNAME;
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD;

let driver: Driver | null = null;

// Validate environment variables
const validateEnvVars = () => {
  if (!NEO4J_URI) {
    throw new Error('NEO4J_URI environment variable is not set');
  }
  if (!NEO4J_USERNAME) {
    throw new Error('NEO4J_USERNAME environment variable is not set');
  }
  if (!NEO4J_PASSWORD) {
    throw new Error('NEO4J_PASSWORD environment variable is not set');
  }
  
  console.log('✅ Neo4j environment variables loaded:', {
    uri: NEO4J_URI,
    username: NEO4J_USERNAME,
    password: NEO4J_PASSWORD ? '***' : 'NOT SET'
  });
};

// Initialize Neo4j driver
export const initNeo4j = (): Driver => {
  // Only run on server side
  if (typeof window !== 'undefined') {
    throw new Error('Neo4j driver cannot be initialized on the client side');
  }

  if (!driver) {
    try {
      // Validate environment variables first
      validateEnvVars();
      
      driver = neo4j.driver(
        NEO4J_URI!,
        neo4j.auth.basic(NEO4J_USERNAME!, NEO4J_PASSWORD!),
        {
          maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
          maxConnectionPoolSize: 50,
          connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes
          disableLosslessIntegers: true,
        }
      );
      
      // Test the connection
      driver.verifyConnectivity()
        .then(() => console.log('✅ Neo4j connection established successfully'))
        .catch((error) => console.error('❌ Neo4j connection failed:', error));
        
    } catch (error) {
      console.error('Failed to create Neo4j driver:', error);
      throw error;
    }
  }
  return driver;
};

// Get Neo4j driver instance
export const getNeo4jDriver = (): Driver => {
  // Only run on server side
  if (typeof window !== 'undefined') {
    throw new Error('Neo4j driver cannot be accessed on the client side');
  }

  if (!driver) {
    return initNeo4j();
  }
  return driver;
};

// Create a new session
export const getSession = (): Session => {
  const driver = getNeo4jDriver();
  return driver.session();
};

// Execute a read query
export const executeRead = async <T>(
  query: string,
  parameters: Record<string, any> = {}
): Promise<T[]> => {
  const session = getSession();
  try {
    console.log('Neo4j executeRead - Query:', query);
    console.log('Neo4j executeRead - Parameters:', parameters);
    
    const result = await session.executeRead(tx => tx.run(query, parameters));
    return result.records.map(record => record.toObject());
  } catch (error) {
    console.error('Neo4j executeRead error:', error);
    console.error('Query:', query);
    console.error('Parameters:', parameters);
    throw error;
  } finally {
    await session.close();
  }
};

// Execute a write query
export const executeWrite = async <T>(
  query: string,
  parameters: Record<string, any> = {}
): Promise<T[]> => {
  const session = getSession();
  try {
    console.log('Neo4j executeWrite - Query:', query);
    console.log('Neo4j executeWrite - Parameters:', parameters);
    
    const result = await session.executeWrite(tx => tx.run(query, parameters));
    return result.records.map(record => record.toObject());
  } catch (error) {
    console.error('Neo4j executeWrite error:', error);
    console.error('Query:', query);
    console.error('Parameters:', parameters);
    throw error;
  } finally {
    await session.close();
  }
};

// Execute a transaction with multiple operations
export const executeTransaction = async <T>(
  operations: (tx: any) => Promise<T>
): Promise<T> => {
  const session = getSession();
  try {
    return await session.executeWrite(operations);
  } finally {
    await session.close();
  }
};

// Close the driver (call this when shutting down the app)
export const closeNeo4j = async (): Promise<void> => {
  if (driver) {
    await driver.close();
    driver = null;
  }
};

// Health check
export const checkNeo4jHealth = async (): Promise<boolean> => {
  try {
    const driver = getNeo4jDriver();
    await driver.verifyConnectivity();
    return true;
  } catch (error) {
    console.error('Neo4j health check failed:', error);
    return false;
  }
};
