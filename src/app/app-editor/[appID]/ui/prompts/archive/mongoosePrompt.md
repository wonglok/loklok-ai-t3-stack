```js
function createModels({ appID }) {
    const output = {}
    // ✅ Dynamic DB selection – each app gets its own DB namespace
    const db = mongoose.connection.useDb(`app_${appID}`, { useCache: true });

    // USER SCHEMA – registration & authentication
    if (!db.models['User']) {
        const userSchema = new mongoose.Schema(
            {
                email: {
                    type: String,
                    required: true,
                    unique: true,
                    validate: {
                        validator: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
                        message: props => `${props.value} is not a valid email!`
                    }
                },

                passwordHash: {
                    type: String,
                    required: true,
                    select: false  // hide by default
                },

                lastLogin: { type: Date },

                status: { type: String, default: 'unverified',  },
            },
            {
                timestamps: true,  // add createdAt / updatedAt
                versionKey: false   
            }
        );


        // Pre‑save – hash plain password if it changed
        userSchema.pre('save', async function (next) {
            if (this.isModified('password')) {
                this.passwordHash = await bcrypt.hash(this.password, 12);
                this.password = undefined; // erase plain pwd
            }
            next();
        });

        db.model('User', userSchema);
    }
    output = {
        ...output
        User: db.model('User'),
        // more models
    }

    // RETURN ALL MODELS FOR THIS TENANT
    return output ;
}
```
