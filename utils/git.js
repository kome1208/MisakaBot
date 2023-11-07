require('dotenv').config();
const { Octokit } = require('octokit');
const octokit = new Octokit({ auth: process.env['GITHUB_TOKEN'] });

module.exports = {
    Git: class {
        constructor({ owner, repo, branch }) {
            this.owner = owner;
            this.repo = repo;
            this.branch = branch;
        }
        async getFile(path) {
            const tree = await octokit.request('GET /repos/{owner}/{repo}/commits', {
                owner: this.owner,
                repo: this.repo
            });
            const res = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner: this.owner,
                repo: this.repo,
                path,
                ref: tree.data[0].sha
            });
            return res.data;
        }
        async updateRef({ file, content, message }) {
            const latestCommit = await octokit.request('GET /repos/{owner}/{repo}/commits', {
                owner: this.owner,
                repo: this.repo
            });
            const createdTree = await octokit.rest.git.createTree({
                owner: this.owner,
                repo: this.repo,
                tree: [{
                    type: file.type,
                    path: file.path,
                    mode: '100644',
                    content
                }],
                base_tree: latestCommit.data[0].sha
            });
            const createdCommit = await octokit.rest.git.createCommit({
                owner: this.owner,
                repo: this.repo,
                message,
                tree: createdTree.data.sha,
                parents: [latestCommit.data[0].sha]
            });
    
            await octokit.rest.git.updateRef({
                owner: this.owner,
                repo: this.repo,
                ref: `heads/${this.branch}`,
                sha: createdCommit.data.sha
            });
        }
    }
}