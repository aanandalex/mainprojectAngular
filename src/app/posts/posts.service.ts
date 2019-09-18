import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';


import { Post } from './post.model';
import { post } from 'selenium-webdriver/http';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  constructor(private http: HttpClient, private router: Router) { }

  posts: Post[] = [];
  postsUpdated = new Subject<{ posts: Post[], postCount: number }>();

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http.get<{ message: string, posts: any, maxPosts: number }>("https://crowdfundingstarter.herokuapp.com/getProject" + queryParams).pipe(map((postData) => {
      return {
        posts: postData.posts.map(post => {
          return {
            id: post._id,
            title: post.title,
            content: post.content,
            imagePath: post.imagePath,
            creator: post.creator
          }
        }),
        maxPosts: postData.maxPosts
      };
    })).subscribe((transformedPostData) => {
      console.log(transformedPostData);
      this.posts = transformedPostData.posts;
      this.postsUpdated.next({ posts: [...this.posts], postCount: transformedPostData.maxPosts });
    });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{ 
      _id: string; 
      title: string; 
      content: string; 
      imagePath: string;
      creator: string;
    }>("https://crowdfundingstarter.herokuapp.com/updateProject/" + id);
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);
    this.http.post<{ message: string, post: Post }>("https://crowdfundingstarter.herokuapp.com/postProject", postData)
      .subscribe(responseData => {
        this.router.navigate(["/"]);
      })
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof (image) === 'object') {
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
    } else {
      postData = { id: id, title: title, content: content, imagePath: image, creator: null };
    }
    this.http.put("https://crowdfundingstarter.herokuapp.com/updateProject/" + id, postData)
      .subscribe(response => {
        this.router.navigate(["/"]);
      });
  }

  deletePost(postId: string) {
    return this.http.delete("https://crowdfundingstarter.herokuapp.com/deleteProject/" + postId);
     
  }
}
