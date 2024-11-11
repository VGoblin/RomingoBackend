'use strict';
/**
 * Include Required Scripts
 */
const pg = require('../db/postgres/postgres.js');
const crypto = require('crypto');
const { sendResetPasswordLink } = require('../sendgrid/sendgrid.js');

async function createUser(parent, args) {
    const hashedPassword = await hash(args.input.password);
    const [userData] = await pg.createUser(
        args.input.email,
        hashedPassword,
    );
    const { id, email } = userData;
    // console.log(id, email)

    // await sendResetPasswordLink({
    //     request: {
    //         email: args.input.email,
    //         password: args.input.password,
    //     }
    // }, true);

    return {
        id,
        email
    };
}

async function createAdminUser(email) {
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hash(tempPassword);
    const [userData] = await pg.createUser(
        email,
        hashedPassword,
        true
    );
    const { id } = userData;


    await sendResetPasswordLink({
        request: {
            email: email,
            password: tempPassword,
        }
    }, true);

    return {
        id,
        email
    };
}

// createAdminUser('j.fraser.santarosa@gmail.com')

async function loginUser(parent, args) {
    const enteredPassword = args.input.password,
        enteredEmail = args.input.email;
    try {
        const [userRecord] = await pg.getUser(enteredEmail);
        const { id, email, password, isAdmin } = userRecord;
        console.log(userRecord)
        const isVerifyPassword = await verify(enteredPassword, password);
        if (isVerifyPassword) return { id, email, isAdmin }
    } catch (error) {
        return {
            id: "not found",
            email: "Please check your email and try again"
        }
    }
}

async function checkUserForReset (parent, args) {
    const enteredEmail = args.input.email;
    try {
        const [userRecord] = await pg.getUser(enteredEmail);
        const { id, email } = userRecord;
        if (email) {
            const token = crypto.randomBytes(64).toString('hex');
            await pg.updateTokenForReset(email, token);
            const emailData = {
                request: {
                    email: email,
                    token: token,
                    userId: id
                }
            }
            await sendResetPasswordLink(emailData);
            return {
                status: 200,
                message: "The reset password link has been sent to the user email"
            }
        }
    } catch (error) {
        return {
            status: 404,
            message: "Please check your email and try again"
        }
    }
}

async function resetUserPassword(parent, args) {
    const userId = args.input.userId, newPassword = args.input.newPassword;
    const makeHash = await hash(newPassword);
    const [updatePassword] = await pg.updateUserPassword(userId, makeHash)
    
    if (updatePassword) return {
        status: 200,
        message: "Password has been resetted. Please Login again!"
    }
}

async function createUserProfile (parent, args) {
    if (args.input.pets) {
        const petData = args.input.pets.map(pet => ({
            userId: args.input.userId,
            ...pet
        }));

        await pg.addPetsData(petData);
        return { id: args.input.userId, pets: petData }
    }

    const [user] =  await pg.updateUserProfileById(
        args.input.userId,
        args.input.name,
        args.input.bio,
        args.input.location,
    );

    return {...user, pets: []};
}

async function getUserProfile (parent, args) {
    const userDetails = await pg.getUserProfileData(args.input.email);
    const pets = await pg.getPetsByUserId(args.input.id);

    return {...userDetails[0], pets}
}

/**
 * Crypto Hash and verify password
 */

 async function hash(password) {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(8).toString("hex")

        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(salt + ":" + derivedKey.toString('hex'))
        });
    })
}

async function verify(password, hash) {
    return new Promise((resolve, reject) => {
        const [salt, key] = hash.split(":")
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(key == derivedKey.toString('hex'))
        });
    })
}

module.exports = {
    createUser,
    loginUser,
    checkUserForReset,
    resetUserPassword,
    createUserProfile,
    getUserProfile,
};
