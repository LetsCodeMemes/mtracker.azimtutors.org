import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "./db";
import { EmailNotificationService } from "./lib/email-notifications";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const SALT_ROUNDS = 10;

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  subject: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  token?: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Verify JWT token
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
    };
    return decoded as AuthUser;
  } catch {
    return null;
  }
}

// Sign up user
export async function signupUser(
  email: string,
  username: string,
  password: string,
  firstName: string,
  lastName: string,
  subject: string
): Promise<AuthResponse> {
  const client = await pool.connect();
  try {
    // Check if user exists
    const existingUser = await client.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      if (existingUser.rows[0].email === email) {
        return {
          success: false,
          message: "Email already registered",
        };
      } else {
        return {
          success: false,
          message: "Username already taken",
        };
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await client.query(
      `INSERT INTO users (email, username, password_hash, first_name, last_name, subject)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, username, first_name, last_name, subject`,
      [email, username, passwordHash, firstName, lastName, subject]
    );

    const user = result.rows[0] as AuthUser;

    // Create user plan (free plan with 3 papers limit)
    await client.query(
      `INSERT INTO user_plans (user_id, plan_type, max_papers, papers_submitted)
       VALUES ($1, 'free', 3, 0)
       ON CONFLICT DO NOTHING`,
      [user.id]
    );

    // Create user streaks record
    await client.query(
      `INSERT INTO user_streaks (user_id, current_streak, longest_streak)
       VALUES ($1, 0, 0)
       ON CONFLICT DO NOTHING`,
      [user.id]
    );

    // Create user points record
    await client.query(
      `INSERT INTO user_points (user_id, total_points, level, experience)
       VALUES ($1, 0, 1, 0)
       ON CONFLICT DO NOTHING`,
      [user.id]
    );

    // Create default notification preferences
    await EmailNotificationService.createDefaultPreferences(user.id);

    const token = generateToken(user);

    return {
      success: true,
      message: "Account created successfully",
      user,
      token,
    };
  } finally {
    client.release();
  }
}

// Login user
export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        message: "Email not found",
      };
    }

    const user = result.rows[0];
    const passwordMatch = await verifyPassword(password, user.password_hash);

    if (!passwordMatch) {
      return {
        success: false,
        message: "Incorrect password",
      };
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      subject: user.subject,
    };

    const token = generateToken(authUser);

    return {
      success: true,
      message: "Login successful",
      user: authUser,
      token,
    };
  } finally {
    client.release();
  }
}
