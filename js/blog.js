/* global Github, USERNAME, REPO, TOKEN */
(function () {
  'use strict'

  var git = new Github({
    token: TOKEN,
    auth: 'oauth'
  })

  var api = {
    showPosts: function (error, issues) {
      if (error) {
        return
      }

      var posts = document.querySelector('.posts')

      posts.innerHTML = ''
      for (var issue of issues) {
        var post = api.createPost(issue)
        if (post) {
          posts.innerHTML += post.toString()
        }
      }
    },
    showPost: function (error, issue) {
      if (error) {
        return
      }

      var posts = document.querySelector('.posts')
      var post = api.createPost(issue)

      if (!issue.comments) {
        posts.innerHTML = post.toString()
        return
      }

      git._request('GET', issue.comments_url, {}, function (error, comments) {
        if (error || !comments) {
          posts.innerHTML = post.toString()
          return
        }

        var parent = new window.Node('div', { class: 'comments' })
        for (var comment of comments) {
          var container = new window.Node('div', {
            id: comment.id,
            class: 'comment'
          })
          var author = new window.Node('a', {
            class: 'author',
            href: comment.user.html_url
          })
          author.append(comment.user.login)

          var date = new window.Node('span', { class: 'date' })
          date.append(new Date(comment.created_at).toLocaleDateString())

          var body = new window.Node('div', { class: 'body' })
          body.append(comment.body.replace(/<pre>/g, '<pre class="prettyprint">'))

          container.append(author)
          container.append(date)
          container.append(body)

          parent.append(container)
        }

        parent.append(new window.Node('a', { href: issue.html_url }).append('comment'))
        post.append(parent)

        posts.innerHTML = post.toString()
      })
    },
    createPost: function (issue) {
      if (issue.user.login !== USERNAME) {
        return
      }

      var container = new window.Node('div', { id: issue.id, class: 'post' })

      var title = new window.Node('h1', { class: 'title' })
      title.append(new window.Node('a', { href: '?' + issue.number }).append(issue.title))
      container.append(title)

      if (issue.labels.length) {
        var categories = new window.Node('div', { class: 'categories' }).append('in ')
        for (var label of issue.labels) {
          categories
            .append(new window.Node('span', { style: 'color: #' + label.color })
            .append(label.name + ', '))
        }
        container.append(categories)
      }

      var meta = new window.Node('div', { class: 'meta' })
      meta.append('by ')
      meta.append(new window.Node('a', { href: issue.user.html_url }).append(issue.user.login))
      meta.append(', ')
      meta.append(new Date(issue.created_at).toLocaleDateString())
      if (issue.comments) {
        meta.append(' &middot; ')
        meta.append(new window.Node('a', {
          href: '?' + issue.number
        }).append(issue.comments + ' comment(s)'))
      }
      container.append(meta)

      var body = new window.Node('div', { class: 'body' })
      body.append(issue.body.replace(/<pre>/g, '<pre class="prettyprint">'))
      container.append(body)

      return container
    }
  }

  window.addEventListener('load', function () {
    var search = window.location.search
    if (search) {
      git.getIssues(USERNAME, REPO)
        .get(search.slice(1), api.showPost)
    } else {
      git.getIssues(USERNAME, REPO).list({}, api.showPosts)
    }
  })
}())
