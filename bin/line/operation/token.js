"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.token = exports.TokenUsage = void 0;
const config_1 = require("../../config");
const os_1 = require("os");
const safe_1 = __importDefault(require("colors/safe"));
const command_line_usage_1 = __importDefault(require("command-line-usage"));
const draw_1 = require("../../draw");
const issue_1 = require("./option/issue");
const revoke_1 = require("./option/revoke");
const verify_1 = require("./option/verify");
exports.TokenUsage = [
    {
        header: safe_1.default.green('Issue/Revoke/Verify access token '),
        content: `After channel ID and secret are configured. Issue a channel access token and save it.` +
            os_1.EOL +
            os_1.EOL +
            safe_1.default.cyan(`line token --issue`) +
            os_1.EOL +
            os_1.EOL +
            `To revoke an access token, run with --revoke option.` +
            os_1.EOL +
            os_1.EOL +
            safe_1.default.cyan(`line token --revoke`) +
            `To verify an access token, run with --verify option.` +
            os_1.EOL +
            os_1.EOL +
            safe_1.default.cyan(`line token --verify`)
    },
    {
        header: 'Options',
        optionList: [
            {
                name: safe_1.default.cyan('issue'),
                description: 'Issue a channel access token from pre-configured channel ID and secret'
            },
            {
                name: safe_1.default.cyan('revoke'),
                typeLabel: safe_1.default.grey('{underline accessToken}'),
                description: 'Revoke a channel access token.'
            },
            {
                name: safe_1.default.cyan('verify'),
                typeLabel: safe_1.default.grey('{underline accessToken}'),
                description: 'Verify a channel access token.'
            }
        ]
    }
];
const token = async (options) => {
    if (!options ||
        (options.issue !== true &&
            options.revoke !== true &&
            options.verify !== true)) {
        await draw_1.drawHelp();
        console.log(command_line_usage_1.default(exports.TokenUsage));
        return false;
    }
    const configFileNameText = safe_1.default.white(config_1.CONFIG_FILE_NAME);
    if (!config_1.config().channel.id) {
        console.log(safe_1.default.yellow('Channel ID not found'));
        console.log(safe_1.default.green(`Setup channel ID at ${configFileNameText} and re-run again`));
        return false;
    }
    if (!config_1.config().channel.secret) {
        console.log(safe_1.default.yellow('Channel secret not found'));
        console.log(safe_1.default.green(`Setup channel secret at ${configFileNameText} and re-run again`));
        return false;
    }
    if (options.issue === true) {
        return issue_1.issue();
    }
    else if (options.revoke === true) {
        return revoke_1.revoke();
    }
    else {
        return verify_1.verify();
    }
};
exports.token = token;
//# sourceMappingURL=token.js.map