# Database Migrations

This directory contains all database migration files for the Clicx Platform Backend.

## Migration Files

The migrations are designed to be run in order to create the complete database schema:

1. **001_create_users_table.js** - Creates the users table with authentication and profile fields
2. **002_create_model_profiles_table.js** - Creates the model profiles table for content creators
3. **003_create_posts_table.js** - Creates the posts table for user content
4. **004_create_media_table.js** - Creates the media table for post attachments
5. **005_create_videos_table.js** - Creates the videos table for video-specific metadata
6. **006_create_comments_table.js** - Creates the comments table for post interactions
7. **007_create_likes_table.js** - Creates the likes table for post reactions
8. **008_create_saved_posts_table.js** - Creates the saved posts table for user bookmarks
9. **009_create_purchases_table.js** - Creates the purchases table for premium content
10. **010_create_follows_table.js** - Creates the follows table for user relationships
11. **011_create_referrals_table.js** - Creates the referrals table for user invitations
12. **012_create_orders_table.js** - Creates the orders table for e-commerce
13. **013_create_payments_table.js** - Creates the payments table for order transactions
14. **014_create_logs_table.js** - Creates the logs table for system monitoring

## Running Migrations

### Prerequisites

1. Ensure your database is running and accessible
2. Set up your environment variables in `.env` file
3. Install dependencies: `npm install`

### Commands

```bash
# Run all pending migrations
npm run migrate

# Alternative command
npm run db:setup

# Reset and re-run all migrations (development only)
npm run migrate:reset
```

### Manual Execution

You can also run migrations directly:

```bash
node src/migrations/migrate.js
```

## Migration System

The migration system:

- Automatically tracks which migrations have been executed
- Creates a `migrations` table to track execution history
- Supports rollback functionality (though not fully implemented in this version)
- Handles foreign key constraints and indexes
- Provides detailed logging during execution

## Database Schema

The complete schema includes:

- **User Management**: Users, profiles, authentication
- **Content System**: Posts, media, videos, comments
- **Social Features**: Likes, follows, saved posts
- **E-commerce**: Orders, payments, purchases
- **Referral System**: User invitations and rewards
- **Logging**: System and request logging

## Notes

- All tables use UUID primary keys for scalability
- Foreign key relationships are properly defined with CASCADE/SET NULL rules
- Appropriate indexes are created for performance
- JSONB fields are used for flexible metadata storage
- Timestamps are automatically managed
- Enum fields ensure data integrity

## Troubleshooting

If migrations fail:

1. Check database connection in `.env`
2. Ensure PostgreSQL is running
3. Verify user permissions
4. Check logs for specific error messages
5. Manually inspect the `migrations` table if needed

## Development

To add new migrations:

1. Create a new numbered migration file
2. Follow the existing pattern with `up` and `down` functions
3. Add the migration to the `migrations` array in `migrate.js`
4. Test the migration locally before committing
