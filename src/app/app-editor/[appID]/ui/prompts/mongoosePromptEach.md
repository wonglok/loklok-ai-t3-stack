```js

export function defineOneModel({ db, output, bcrypt }) {
    // 
    // // USER SCHEMA (registration & authentication) - Example Code below:
    // Remove Example Code in when you generate code.
    // if (!db.models['User']) {
    //     const userSchema = new mongoose.Schema(
    //         {
    //             email: {
    //                 type: String,
    //                 required: true,
    //                 unique: true,
    //             },
    //             passwordHash: {
    //                 type: String,
    //                 required: true,
    //                 select: false  // hide by default
    //             },
    //             lastLogin: { type: Date },
    //             status: { type: String, default: 'unverified',  },
    //         },
    //         {
    //             timestamps: true,  // add createdAt / updatedAt
    //             versionKey: false   
    //         }
    //     );
    //     // Pre‑save – hash plain password if it changed
    //     userSchema.pre('save', async function (next) {
    //         if (this.isModified('password')) {
    //             this.passwordHash = await bcrypt.hash(this.password, 12);
    //             this.password = undefined; // erase plain pwd
    //         }
    //         next();
    //     });
    //     db.model('User', userSchema);
    // }

    output = {
        ...output

        // User: db.model('User'), // exmaple code of export for User model
    }
}
