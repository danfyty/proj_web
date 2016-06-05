/**
 * Post.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
      id: {
          type: 'integer',
          primaryKey: true,
          autoIncrement: true
      },
      text: {
          type: 'string',
          required: true
      },
      subjects: {
          collection: 'subject',
          via: 'posts',
          dominant: true
      },
      user: {
          model: 'user',
      },
      users_cited: {
          collection: 'user',
          via: 'posts_cited',
          dominant: true,
      }
  }
};

