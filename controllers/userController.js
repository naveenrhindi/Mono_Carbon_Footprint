const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const registerUser = async (req, res) => {
    try {
        const { username, email, password, fullname, contact_no, location } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ 
            username, 
            email, 
            password: hashedPassword,
            fullname,
            contact_no,
            location,
            profile_data: {
                social_links: {
                    twitter: "",
                    linkedin: ""
                },
                bio: "",
                avatar_url: ""
            }
        });
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        res.status(500).json({ error: 'Error registering user', details: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ error: 'Invalid password' });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: 'Error logging in', details: error.message });
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

        // Update basic fields
        let updateData = { email, fullname, contact_no, location };
        
        // Update password if provided
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        // Update profile_data
        const currentProfileData = user.profile_data || {};
        const newProfileData = {
            ...currentProfileData,
            social_links: social_links || currentProfileData.social_links,
            bio: bio || currentProfileData.bio,
            avatar_url: currentProfileData.avatar_url // Preserve existing avatar_url
        };
        updateData.profile_data = newProfileData;

        await user.update(updateData);
        
        // Return updated user without password
        const updatedUser = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });
        
        res.status(200).json({ 
            message: 'User updated successfully', 
            user: updatedUser 
        });
    } catch (error) {
        res.status(500).json({ error: 'Error updating user', details: error.message });
    }
};

const updateAvatar = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update avatar_url in profile_data
        const currentProfileData = user.profile_data || {};
        const newProfileData = {
            ...currentProfileData,
            avatar_url: `/uploads/avatars/${req.file.filename}`
        };

        await user.update({ profile_data: newProfileData });

        res.status(200).json({ 
            message: 'Avatar updated successfully',
            avatar_url: newProfileData.avatar_url
        });
    } catch (error) {
        res.status(500).json({ error: 'Error updating avatar', details: error.message });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        // Find the user
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify password before deletion
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Delete avatar file if it exists
        if (user.profile_data && user.profile_data.avatar_url) {
            const avatarPath = path.join(__dirname, '..', user.profile_data.avatar_url);
            if (fs.existsSync(avatarPath)) {
                fs.unlinkSync(avatarPath);
            }
        }

        // Delete the user
        await user.destroy();
        
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting account', details: error.message });
    }
};

module.exports = { registerUser, loginUser, updateUser, updateAvatar, deleteAccount };
