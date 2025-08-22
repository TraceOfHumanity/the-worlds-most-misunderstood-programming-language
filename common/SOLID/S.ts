class BlogPost {
  private title: string;
  private content: string;

  constructor(title: string, content: string) {
    this.title = title;
    this.content = content;
  }
  
  createPost() {
    console.log(`${this.title} - ${this.content}`);
  }

  updatePost(title: string, content: string) {
    this.title = title;
    this.content = content;
  }

  deletePost() {
    this.title = "";
    this.content = "";
  }

  getPost() {
    return {
      title: this.title,
      content: this.content
    };
  }
}

class BlogPostDisplay {
  private posts: BlogPost;

  constructor(posts: BlogPost) {
    this.posts = posts;
  }

  displayHTML() {
    return `<h1>${this.posts.getPost().title}</h1><p>${this.posts.getPost().content}</p>`;
  }
}