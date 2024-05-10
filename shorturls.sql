-- MariaDB dump 10.19  Distrib 10.4.28-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: shorturls
-- ------------------------------------------------------
-- Server version	10.4.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


--
-- Database structure for database `shorturls`
--

DROP DATABASE IF EXISTS `shorturls`;
CREATE DATABASE shorturls;
USE shorturls;


--
-- Table structure for table `links`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `links` (
    `longurl` varchar(255) DEFAULT NULL,
  `shorturlid` varchar(255) DEFAULT NULL,
  `count` int(11) DEFAULT 0,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `links`
--

LOCK TABLES `links` WRITE;
/*!40000 ALTER TABLE `links` DISABLE KEYS */;
INSERT INTO `links` VALUES ('https://google.com','6kh88660',1,1),('https://google.com','psnhe2wn',0,2),('https://google.com','gpek9yt6',2,3),('https://google.com','581yv2y2',2,4),('https://google.com','vdy0ze0j',2,5),('https://facebook.com','aat2ip81',2,6),('https://youtube.com','rylbngdw',1,7),('https://youtube.com','uxe9bzhb',0,8),('https://code.jquery.com/jquery-3.7.1.min.js','0fjpjsia',3,9),('https://code.jquery.com/jquery-3.7.1.min.js','y9r68xr7',0,10),('https://code.jquery.com/jquery-3.7.1.min.js','itt05i4x',1,11),('https://code.jquery.com/jquery-3.7.1.min.js','4127tzbu',0,12),('https://google.com','s493b8qp',0,13),('https://google.com','028x5jmc',1,14),('https://twitter.com','6mrbrkyt',1,15),('https://agasobanuyefilms.com/uploads/movie/FIGHER%20A.mp4','0dlv0glb',4,16);
/*!40000 ALTER TABLE `links` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-05-10 13:20:52
