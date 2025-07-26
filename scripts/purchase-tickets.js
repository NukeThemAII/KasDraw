import hre from "hardhat";
import fs from 'fs';
const { ethers } = hre;

async function main() {
  // Read deployment info
  const deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
  const contractAddress = deploymentInfo.contractAddress;
  
  console.log("Purchasing tickets for contract at:", contractAddress);
  
  // Get contract instance
  const KasDrawLottery = await ethers.getContractFactory("KasDrawLottery");
  const lottery = KasDrawLottery.attach(contractAddress);
  
  // Get signers
  const [owner, addr1, addr2] = await ethers.getSigners();
  
  // Purchase tickets from different accounts
  const ticketPrice = ethers.parseEther("0.1"); // 0.1 KAS per ticket
  
  console.log("\nPurchasing tickets...");
  
  // Owner purchases 2 tickets
  const ownerTickets = [
    [1, 5, 10, 15, 20],
    [2, 7, 12, 18, 25]
  ];
  
  let tx = await lottery.connect(owner).purchaseTickets(ownerTickets, {
    value: ticketPrice * BigInt(ownerTickets.length)
  });
  await tx.wait();
  console.log(`Owner purchased ${ownerTickets.length} tickets`);
  
  // Addr1 purchases 3 tickets
  const addr1Tickets = [
    [3, 8, 13, 19, 30],
    [4, 9, 14, 21, 32],
    [6, 11, 16, 23, 35]
  ];
  
  tx = await lottery.connect(addr1).purchaseTickets(addr1Tickets, {
    value: ticketPrice * BigInt(addr1Tickets.length)
  });
  await tx.wait();
  console.log(`Addr1 purchased ${addr1Tickets.length} tickets`);
  
  // Addr2 purchases 2 tickets
  const addr2Tickets = [
    [1, 6, 11, 16, 21],
    [5, 10, 15, 20, 25]
  ];
  
  tx = await lottery.connect(addr2).purchaseTickets(addr2Tickets, {
    value: ticketPrice * BigInt(addr2Tickets.length)
  });
  await tx.wait();
  console.log(`Addr2 purchased ${addr2Tickets.length} tickets`);
  
  // Get lottery stats
  const stats = await lottery.getLotteryStats();
  console.log("\nLottery Stats:");
  console.log("Current Jackpot:", ethers.formatEther(stats[0]), "KAS");
  console.log("Tickets Sold This Draw:", stats[1].toString());
  console.log("Total Tickets:", stats[2].toString());
  console.log("Next Draw Time:", new Date(Number(stats[3]) * 1000).toLocaleString());
  console.log("Executor Reward:", ethers.formatEther(stats[4]), "KAS");
  console.log("Can Execute:", stats[5]);
  
  console.log("\nTickets purchased successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });