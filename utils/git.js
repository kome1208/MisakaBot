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
            const tree = await this.getTree();
            return tree.data.tree.find((file) => file.path === path);
        }
        async getBlob(file_sha) {
            const blob = await octokit.rest.git.getBlob({
                owner: this.owner,
                repo: this.repo,
                file_sha
            });
            return Buffer.from(blob.data.content, 'base64').toString('utf-8');
        }
        async getTree() {
            const branch = await this.getBranch();
            return octokit.rest.git.getTree({
                owner: this.owner,
                repo: this.repo,
                tree_sha: branch.data.commit.sha
            });
        }
        async getBranch() {
            return octokit.rest.repos.getBranch({
                owner: this.owner,
                repo: this.repo,
                branch: this.branch
            });
        }
        async updateRef({ file, content, message }) {
            const latestCommit = await this.getBranch();
            const createdBlob = await octokit.rest.git.createBlob({
                owner: this.owner,
                repo: this.repo,
                content: Buffer.from(content, 'utf-8').toString('base64'),
                encoding: 'base64'
            });
            const createdTree = await octokit.rest.git.createTree({
                owner: this.owner,
                repo: this.repo,
                tree: [{
                    type: file.type,
                    path: file.path,
                    mode: file.mode,
                    sha: createdBlob.data.sha
                }],
                base_tree: latestCommit.data.commit.sha
            });
            const createdCommit = await octokit.rest.git.createCommit({
                owner: this.owner,
                repo: this.repo,
                message,
                tree: createdTree.data.sha,
                parents: [latestCommit.data.commit.sha]
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