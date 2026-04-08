import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export class RefreshToken extends Model {}

RefreshToken.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        token: {
            type: DataTypes.STRING(250),
            unique: true,
            allowNull: false
        },

        expires_at: {
            type: DataTypes.DATE,
            allowNull: false
        },

        revoked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        device: {
            type: DataTypes.STRING(250)
        },

        ip_address: {
            type: DataTypes.STRING(20)
        },

        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    },
    {
        sequelize,
        tableName: 'refresh_tokens',
        timestamps: false
    }
)
