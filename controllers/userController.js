const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const registerUser = async (req, res) => {
    try {
        const { username, email, password, fullname, contact_no, location, profile_data } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ 
            where: { email } 
        });

        if (existingUser) {
            return res.status(400).json({ 
                error: 'User already exists',
                message: 'Email already registered' 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Set default profile data if not provided
        const defaultProfileData = {
            social_links: {
                twitter: "",
                linkedin: ""
            },
            bio: "",
            avatar_url: ""
        };

        const userData = { 
            username, 
            email, 
            password: hashedPassword,
            fullname,
            contact_no,
            location,
            profile_data: profile_data || defaultProfileData
        };

        console.log('Attempting to create user with data:', {
            ...userData,
            password: '[HIDDEN]'
        });

        const user = await User.create(userData);

        // Create response object without password
        const userResponse = {
            id: user.id,
            username: user.username,
            email: user.email,
            fullname: user.fullname,
            contact_no: user.contact_no,
            location: user.location,
            profile_data: user.profile_data
        };

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            error: 'Error registering user', 
            message: error.message 
        });
    }
};

const loginUser = async (req, res) => {
    console.log('Login attempt with:', { ...req.body, password: '[HIDDEN]' });
    
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ 
            where: { email },
            raw: true // Get plain object instead of Sequelize instance
        });

        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ 
                error: 'Authentication failed',
                message: 'Invalid email or password'
            });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({ 
                error: 'Authentication failed',
                message: 'Invalid email or password'
            });
        }

        // Create response object without password
        const userResponse = {
            id: user.id,
            username: user.username,
            email: user.email,
            fullname: user.fullname,
            contact_no: user.contact_no,
            location: user.location,
            profile_data: user.profile_data
        };

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        console.log('Login successful for user:', email);

        // Send success response
        res.status(200).json({
            message: 'Login successful',
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'Error during login',
            message: error.message
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const { email, password, fullname, contact_no, location, social_links, bio } = req.body;
        
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update basic info
        if (email) user.email = email;
        if (fullname) user.fullname = fullname;
        if (contact_no) user.contact_no = contact_no;
        if (location) user.location = location;

        // Update password if provided
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        // Update profile data
        const currentProfileData = user.profile_data || {};
        user.profile_data = {
            ...currentProfileData,
            social_links: social_links || currentProfileData.social_links || {},
            bio: bio || currentProfileData.bio || ""
        };

        await user.save();

        // Create response object without password
        const userResponse = {
            id: user.id,
            username: user.username,
            email: user.email,
            fullname: user.fullname,
            contact_no: user.contact_no,
            location: user.location,
            profile_data: user.profile_data
        };

        res.status(200).json({
            message: 'User updated successfully',
            user: userResponse
        });
    } catch (error) {
        res.status(500).json({ error: 'Error updating user', details: error.message });
    }
};

const updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = req.user.id;
        const user = await User.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get the old avatar path if it exists
        const currentProfileData = user.profile_data || {};
        const oldAvatarPath = currentProfileData.avatar_url;

        // Delete old avatar file if it exists
        if (oldAvatarPath && fs.existsSync(oldAvatarPath)) {
            fs.unlinkSync(oldAvatarPath);
        }

        // Update profile data with new avatar path
        user.profile_data = {
            ...currentProfileData,
            avatar_url: req.file.path
        };

        await user.save();

        res.status(200).json({
            message: 'Avatar updated successfully',
            avatar_url: req.file.path
        });
    } catch (error) {
        res.status(500).json({ error: 'Error updating avatar', details: error.message });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete avatar file if it exists
        const profileData = user.profile_data || {};
        if (profileData.avatar_url && fs.existsSync(profileData.avatar_url)) {
            fs.unlinkSync(profileData.avatar_url);
        }

        await user.destroy();
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting account', details: error.message });
    }
};

module.exports = { registerUser, loginUser, updateUser, updateAvatar, deleteAccount };
