import React, { Component } from 'react';
import { Row, Col, Card, Button, Navbar, NavItem } from 'react-materialize';
import * as _ from 'underscore';
import Search from './Search';
import Results from './Results';
import Entry from './Entry';
import { Scrollbars } from 'react-custom-scrollbars';



class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tags: null,
      entry: null,
      links: [],
      posts: [],
      view: 'posts',
      page: 0 };

    this.get = _.debounce(this.get.bind(this), 500);
  }

  getPosts(tags, cb) {
    const q = JSON.stringify(tags);

    $.ajax({
      url: `/api/posts?tags=${q}`,
      page: this.state.page,
      method: 'GET',
      success: data => cb(null, data),
      error: error => cb(error, null) });
  }

  getLinks(id, cb) {
    //const q = JSON.stringify(id);

    $.ajax({
      url: `/api/posts/${id}`,
      method: 'GET',
      success: data => cb(null, data),
      error: error => cb(error, null) });
  }

  get(str, cb) {
    const tags = str.split(' ').filter(word => word.length > 0);
    if (tags.length > 0) {
      this.getPosts(tags, (errorPosts, blogPosts) => {
        if (errorPosts) {
          throw errorPosts;
        }
        if (blogPosts.length === 0) {
          if (this.state.page === 0) {
            this.setState({
              tags: null,
              posts: [],
              entry: null,
              links: [] 
            });
          }
        } else if (this.state.page > 0) {
          this.setState({
            posts: this.state.posts.concat(blogPosts)
          });
        } else {
          this.getLinks(blogPosts[0].postId, (errorLinks, blogLinks) => {
            if (errorLinks) {
              throw errorLinks;
            }
            this.setState({
              tags: tags,
              posts: blogPosts,
              entry: {
                title: blogPosts[0].title,
                rank: blogPosts[0].rank,
                description: blogPosts[0].description,
                url: blogPosts[0].url
              },
              links: blogLinks 
            });
          });
        }
      });
    }
  }

  resultsClickHandler(index) {
    this.getLinks(this.state.posts[index].postId, (err, blogLinks) => {
      this.setState({
        entry: {
          title: this.state.posts[index].title,
          rank: this.state.posts[index].rank,
          description: this.state.posts[index].description,
          url: this.state.posts[index].url
        },
        links: blogLinks
      });
    });
  }

  pageHandler(str, page) {
    this.setState({
      page: page
    }, () => this.get(str));
  };

  postsViewClickHandler() {
    this.setState({
      view: 'posts'
    });
  }

  authorsViewClickHandler() {
    this.setState({
      view: 'authors'
    });
  }

  componentDidMount() {
    this.get('javascript');
  }

  componentDidUpdate() {
    $('.collapsible').collapsible({
      accordion : true
    });
  }

  render() {
    return (
    <div>
      <Row>
        <Navbar>
          <Col className="logo center-align" s={4}>
            <h4>BLOGRANK</h4>
          </Col>
          <Col className="center-align" s={4}>
            <h4>Results</h4>
          </Col>
          <Col className="center-align" s={4}>
            <h4>Details</h4>
          </Col>
        </Navbar>
      </Row>
      <Row>
        <Col s={4}>
          <Search query={(str) => this.pageHandler(str, 0)}/>
          <Navbar>
            <NavItem onClick={this.postsViewClickHandler.bind(this)}>View Posts</NavItem>
            <NavItem onClick={this.authorsViewClickHandler.bind(this)}>View Authors</NavItem>
          </Navbar>
        </Col>
        <Col s={4}>
          <Scrollbars style={{ height: $(window).height() }}> 
            <Results view={this.state.view} className="left-align" resultsClickHandler={this.resultsClickHandler.bind(this)} posts={this.state.posts} />
          </Scrollbars>
        </Col>

        <Col s={4}>
          <Entry entry={this.state.entry} links={this.state.links} />
        </Col>
      </Row>
      </div>
    );
  }
}

export default App;

