import hre from 'hardhat';
const { ethers } = hre;

async function main() {
  const targetAddress = '0x71d7aCcfB0dFB579b8f00de612890FB875E16eef';
  
  // Get the first account (which has lots of ETH on local network)
  const [signer] = await ethers.getSigners();
  
  console.log('Funding account:', targetAddress);
  console.log('From account:', signer.address);
  
  // Check current balance
  const currentBalance = await ethers.provider.getBalance(targetAddress);
  console.log('Current balance:', ethers.formatEther(currentBalance), 'ETH');
  
  // Send 1000 ETH to the target address
  const tx = await signer.sendTransaction({
    to: targetAddress,
    value: ethers.parseEther('1000') // 1000 ETH for testing
  });
  
  console.log('Transaction hash:', tx.hash);
  await tx.wait();
  
  // Check new balance
  const newBalance = await ethers.provider.getBalance(targetAddress);
  console.log('New balance:', ethers.formatEther(newBalance), 'ETH');
  
  console.log('✅ Account funded successfully!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error funding account:', error);
    process.exit(1);
  });