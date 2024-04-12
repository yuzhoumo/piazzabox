/**
 * IMPORTANT: THIS IS A PLACEHOLDER FILE FOR DEVELOPMENT PURPOSES. IT WILL BE
 * OVERWRITTEN BY THE SITE BUILDER!
 */

var getUsers = () => {
  const userMap = new Map();
  [{
    "role": "",
    "name": "Piazza Team",
    "endorser": {},
    "admin": false,
    "photo": "1568998468_200.jpg",
    "id": "gd6v7134AUa",
    "photo_url": "https://cdn-uploads.piazza.com/photos/gd6v7134AUa/1568998468_200.jpg",
    "us": true,
    "facebook_id": null
  }].forEach(user => { userMap.set(user.id, user) });
  return userMap;
};

var getPosts = () => {
  return [{
    "folders": [],
    "nr": 1,
    "data": {
      "embed_links": []
    },
    "created": "2019-08-19T22:16:09Z",
    "bucket_order": 3,
    "no_answer_followup": 0,
    "change_log": [
      {
        "anon": "no",
        "uid": "gd6v7134AUa",
        "data": "jziyku6wmrj7at",
        "type": "create",
        "when": "2019-08-19T22:16:09Z"
      }
    ],
    "bucket_name": "Today",
    "history": [
      {
        "anon": "no",
        "uid": "gd6v7134AUa",
        "subject": "Welcome to Piazza!",
        "created": "2019-08-19T22:16:09Z",
        "content": "\nPiazza is a Q&A platform designed to get you great answers from classmates and instructors fast. We've put together this list of tips you might find handy as you get started:\n\n<ol style=\"margin:0;padding:0;list-style-position:inside;\"> <li style=\"margin:0;padding:0\"><strong>Ask questions!</strong>\n\nThe best way to get answers is to ask questions! Ask questions on Piazza rather than emailing your teaching staff so everyone can benefit from the response (and so you can get answers from classmates who are up as late as you are).\n\n</li><li style=\"margin:0;padding:0\"><strong>Edit questions and answers wiki-style.</strong>\n\nThink of Piazza as a Q&A wiki for your class. Every question has just a single <strong>students' answer</strong> that students can edit collectively (and a single <strong>instructors\u2019 answer</strong> for instructors).\n\n</li><li style=\"margin:0;padding:0\"> <strong>Add a followup to comment or ask further questions.</strong>\n\nTo comment on or ask further questions about a post, start a <strong>followup discussion</strong>. Mark it resolved when the issue has been addressed, and add any relevant information back into the Q&A above.\n\n</li><li style=\"margin:0;padding:0\"> <strong>Go anonymous.</strong>\n\nShy? No problem. You can always opt to post or edit anonymously.\n\n</li><li style=\"margin:0;padding:0\"> <strong>Tag your posts.</strong>\n\nIt's far more convenient to find all posts about your Homework 3 or Midterm 1 when the posts are tagged. Type a \u201c#\u201d before a key word to tag. Click a blue tag in a post or the question feed to filter for all posts that share that tag.\n\n</li><li style=\"margin:0;padding:0\"> <strong>Format code and equations.</strong>\n\nAdding a code snippet? Click the <strong>pre</strong> or <strong>tt</strong> button in the question editor to add pre-formatted or inline teletype text. \nMathematical equation? Click the <strong>Fx</strong> button to access the LaTeX editor to build a nicely formatted equation.\n\n</li><li style=\"margin:0;padding:0\"> <strong>View and download class details and resources.</strong> </li></ol>\n\nClick the <strong>Course Page</strong> button in your top bar to access the class syllabus, staff contact information, office hours details, and course resources\u2014all in one place!\n\n\nContact the Piazza Team anytime with questions or comments at <strong>team@piazza.com</strong>. We love feedback!\n\n Test LaTeX:\n $$\\frac{(n)^{log_23}}{n}$$ to $$O(n^{log_23})$$"
      }
    ],
    "type": "note",
    "tags": [
      "student"
    ],
    "tag_good": [],
    "unique_views": 604,
    "children": [],
    "tag_good_arr": [],
    "id": "jziyku6vqrk7as",
    "config": {
      "is_default": 1
    },
    "status": "active",
    "drafts": null,
    "request_instructor": 0,
    "request_instructor_me": false,
    "bookmarked": 0,
    "num_favorites": 2,
    "my_favorite": false,
    "is_bookmarked": false,
    "is_tag_good": false,
    "q_edits": [],
    "i_edits": [],
    "s_edits": [],
    "t": 1712739508446,
    "default_anonymity": "no"
  },
  {
    "folders": [],
    "nr": 2,
    "data": {
      "embed_links": []
    },
    "created": "2019-08-19T22:16:09Z",
    "bucket_order": 2,
    "no_answer_followup": 0,
    "change_log": [
      {
        "anon": "no",
        "uid": "gd6v7134AUa",
        "data": "jziyku6wmrj7at",
        "type": "create",
        "when": "2019-08-19T22:16:09Z"
      }
    ],
    "bucket_name": "Today",
    "history": [
      {
        "anon": "no",
        "uid": "gd6v7134AUa",
        "subject": "Test post 2",
        "created": "2019-08-19T22:16:09Z",
        "content": "Lorem Ipsum..."
      }
    ],
    "type": "note",
    "tags": [
      "student"
    ],
    "tag_good": [],
    "unique_views": 40,
    "children": [],
    "tag_good_arr": [],
    "id": "jziyku5vqrk7ab",
    "config": {
      "is_default": 1
    },
    "status": "active",
    "drafts": null,
    "request_instructor": 0,
    "request_instructor_me": false,
    "bookmarked": 0,
    "num_favorites": 2,
    "my_favorite": false,
    "is_bookmarked": false,
    "is_tag_good": false,
    "q_edits": [],
    "i_edits": [],
    "s_edits": [],
    "t": 1712739508446,
    "default_anonymity": "no"
  }];
};
