export type TemplateKind = 'tax' | 'website' | 'trending';

export function sanitizeIdentity(name: string, symbol: string): { name: string; symbol: string } {
  if (!/^[\x20-\x7E]{1,32}$/.test(name) || name.includes('"') || name.includes('\\')) {
    throw new Error('Token name must be 1 to 32 printable characters without quotes.');
  }
  if (!/^[A-Za-z0-9]{1,8}$/.test(symbol)) {
    throw new Error('Token symbol must be 1 to 8 letters or numbers.');
  }
  return { name, symbol };
}

function header(kind: string, name: string, symbol: string): string {
  return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * ${kind}
 * Reviewed local template for ${name} (${symbol}).
 * This source is generated for the selected identity. It is not a copy of an external token.
 */
`;
}

function safeMath(): string {
  return `library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        return a + b;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return a - b;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        return a * b;
    }
}
`;
}

function commonToken(contractName: string, name: string, symbol: string, body: string): string {
  return `contract ${contractName} {
    using SafeMath for uint256;

    string public constant name = "${name}";
    string public constant symbol = "${symbol}";
    uint8 public constant decimals = 18;
    uint256 public immutable totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

${body}

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(amount);
        balanceOf[to] = balanceOf[to].add(amount);
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] = allowance[from][msg.sender].sub(amount);
        balanceOf[from] = balanceOf[from].sub(amount);
        balanceOf[to] = balanceOf[to].add(amount);
        emit Transfer(from, to, amount);
        return true;
    }
}
`;
}

export function renderTemplate(kind: TemplateKind, identity: { name: string; symbol: string }): string {
  const { name, symbol } = sanitizeIdentity(identity.name, identity.symbol);
  if (kind === 'trending') {
    return `${header('TrendingToken', name, symbol)}
${safeMath()}
${commonToken(
  'TrendingToken',
  name,
  symbol,
  `    constructor(uint256 supply) {
        totalSupply = supply;
        balanceOf[msg.sender] = supply;
        emit Transfer(address(0), msg.sender, supply);
    }`,
)}`;
  }
  if (kind === 'website') {
    return `${header('WebsiteToken', name, symbol)}
${safeMath()}
${commonToken(
  'WebsiteToken',
  name,
  symbol,
  `    string public website;

    constructor(uint256 supply, string memory site) {
        totalSupply = supply;
        website = site;
        balanceOf[msg.sender] = supply;
        emit Transfer(address(0), msg.sender, supply);
    }`,
)}`;
  }
  return `${header('TaxToken', name, symbol)}
${safeMath()}
contract TaxToken {
    using SafeMath for uint256;

    string public constant name = "${name}";
    string public constant symbol = "${symbol}";
    uint8 public constant decimals = 18;
    uint256 public immutable totalSupply;
    uint256 public immutable feeBps;
    address public immutable feeRecipient;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(uint256 supply, address recipient, uint256 bps) {
        require(bps <= 500, "fee too high");
        require(recipient != address(0), "recipient");
        totalSupply = supply;
        feeBps = bps;
        feeRecipient = recipient;
        balanceOf[msg.sender] = supply;
        emit Transfer(address(0), msg.sender, supply);
    }

    function _transfer(address from, address to, uint256 amount) internal {
        uint256 fee = amount.mul(feeBps) / 10000;
        uint256 sendAmount = amount.sub(fee);
        balanceOf[from] = balanceOf[from].sub(amount);
        balanceOf[to] = balanceOf[to].add(sendAmount);
        if (fee > 0) balanceOf[feeRecipient] = balanceOf[feeRecipient].add(fee);
        emit Transfer(from, to, sendAmount);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] = allowance[from][msg.sender].sub(amount);
        _transfer(from, to, amount);
        return true;
    }
}
`;
}

export function templateContractName(kind: TemplateKind): string {
  if (kind === 'tax') return 'TaxToken';
  if (kind === 'website') return 'WebsiteToken';
  return 'TrendingToken';
}
