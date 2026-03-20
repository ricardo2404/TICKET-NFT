"use client";

import { useEffect, useState } from "react";
import Login from "../components/Login";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../components/AuthContext";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { QRCodeCanvas } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { motion } from "framer-motion";

// 🔥 FIREBASE
import { db } from "../lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function Home() {
  const { user } = useAuth();
  const { publicKey, wallet } = useWallet();

  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState("home");

  const [ticket, setTicket] = useState<string | null>(null);
  const [tickets, setTickets] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [scannerActive, setScannerActive] = useState(false);

  // 💰 FINANCIAMIENTO (NO MODIFICADO)
  const [funds, setFunds] = useState(0);
  const goal = 5;

  // 🎤 EVENTOS
  const [events, setEvents] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState("");

  // 🛒 MARKET
  const [market, setMarket] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const connection = new Connection("https://api.devnet.solana.com");

  // 🎟️ NFT ORIGINAL (NO MODIFICADO)
  const mintNFT = async () => {
    if (!publicKey || !wallet) {
      setStatus("❌ Conecta tu wallet");
      return;
    }

    try {
      const metaplex = Metaplex.make(connection).use(
        walletAdapterIdentity(wallet.adapter)
      );

      const { nft } = await metaplex.nfts().create(
        {
          uri: "https://raw.githubusercontent.com/metaplex-foundation/metaplex/master/packages/js/test/fixtures/metadata.json",
          name: "Event Ticket NFT",
          sellerFeeBasisPoints: 0,
        },
        { commitment: "finalized" }
      );

      const mint = nft.address.toBase58();

      setTicket(mint);
      setTickets((prev) => [...prev, mint]);

      // 💰 financiamiento
      setFunds((prev) => prev + 1);

      // 🔥 GUARDAR TICKET EN FIREBASE (NUEVO)
      await addDoc(collection(db, "tickets"), {
        mint,
        owner: publicKey.toBase58(),
        event: "Evento Web3",
        createdAt: Date.now(),
        forSale: false,
        price: 0,
      });

      setStatus("🎉 NFT creado REAL");
    } catch (error) {
      console.error(error);
      setStatus("❌ Error creando NFT");
    }
  };

  // 🔗 VALIDACIÓN ORIGINAL
  const validarNFT = async (mintAddress: string) => {
    try {
      const metaplex = Metaplex.make(connection);

      await metaplex.nfts().findByMint({
        mintAddress: new PublicKey(mintAddress),
      });

      setStatus("✅ NFT válido en blockchain");
    } catch {
      setStatus("❌ NFT inválido");
    }
  };

  // 📷 SCANNER ORIGINAL
  useEffect(() => {
    if (!scannerActive) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      (decodedText) => {
        validarNFT(decodedText);
        scanner.clear();
        setScannerActive(false);
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [scannerActive]);

  // 🔥 CARGAR EVENTOS
  useEffect(() => {
    const loadEvents = async () => {
      const snapshot = await getDocs(collection(db, "events"));

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEvents(data);
    };

    loadEvents();
  }, []);

  // 🔥 CARGAR MARKET
  useEffect(() => {
    const loadMarket = async () => {
      const snapshot = await getDocs(collection(db, "market"));

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMarket(data);
    };

    loadMarket();
  }, []);

  // 🔥 CREAR EVENTO
  const createEvent = async () => {
    if (!newEvent) return;

    const docRef = await addDoc(collection(db, "events"), {
      name: newEvent,
      createdAt: Date.now(),
    });

    setEvents((prev) => [
      ...prev,
      { id: docRef.id, name: newEvent },
    ]);

    setNewEvent("");
  };

  // 🔥 VENDER TICKET
  const sellTicket = async (ticket: any) => {
    await addDoc(collection(db, "market"), {
      ...ticket,
      price: 0.1,
      seller: ticket.owner,
    });

    alert("Ticket en venta 🚀");
  };

  // 🔥 COMPRAR TICKET (SOL REAL)
  const buyTicket = async (ticket: any) => {
    if (!publicKey || !wallet) return;

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(ticket.seller),
          lamports: 0.1 * 1000000000,
        })
      );

      const signature = await wallet.adapter.sendTransaction(
        transaction,
        connection
      );

      await connection.confirmTransaction(signature, "confirmed");

      alert("Compra realizada 🚀");
    } catch (error) {
      console.error(error);
    }
  };

  if (!mounted) return null;

  if (!user) return <Login />;

  return (
    <div className="flex">

      <Sidebar setView={setView} />

      <div className="flex-1 p-6 space-y-4 bg-gray-100 min-h-screen">

        <WalletMultiButton />

        {/* 💰 FINANCIAMIENTO */}
        <div className="bg-white p-4 rounded shadow">
          <p>💰 {funds}/{goal} SOL</p>

          <div className="w-full bg-gray-200 h-2 rounded mt-2">
            <div
              className="bg-green-500 h-2 rounded"
              style={{ width: `${(funds / goal) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* EVENTOS */}
        {view === "home" && (
          <div className="grid gap-4">
            {events.map((event) => (
              <motion.div
                key={event.id}
                whileHover={{ scale: 1.03 }}
                className="bg-white p-4 rounded shadow"
              >
                <h2 className="text-xl font-bold">{event.name}</h2>

                <button
                  onClick={mintNFT}
                  className="bg-blue-600 text-white p-2 mt-2 rounded"
                >
                  Comprar Ticket
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* PERFIL */}
        {view === "profile" && (
          <div>
            <h2 className="text-xl font-bold mb-2">Mis Tickets</h2>

            {tickets.map((t, i) => (
              <div key={i} className="bg-white p-3 mt-2 rounded shadow">

                <QRCodeCanvas value={t} size={120} />

                <button
                  onClick={() => validarNFT(t)}
                  className="bg-green-600 text-white w-full mt-2 p-1 rounded"
                >
                  Validar
                </button>

                <button
                  onClick={() =>
                    sellTicket({
                      mint: t,
                      owner: publicKey?.toBase58(),
                    })
                  }
                  className="bg-yellow-600 text-white w-full mt-2 p-1 rounded"
                >
                  Vender
                </button>

              </div>
            ))}
          </div>
        )}

        {/* MARKET */}
        {view === "market" && (
          <div>
            <h2 className="text-xl font-bold">Marketplace</h2>

            {market.map((t) => (
              <div key={t.id} className="bg-white p-3 mt-2 rounded shadow">
                <p className="text-xs break-all">{t.mint}</p>

                <button
                  onClick={() => buyTicket(t)}
                  className="bg-green-600 text-white p-2 mt-2 rounded w-full"
                >
                  Comprar por {t.price} SOL
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ORGANIZADOR */}
        {view === "organizer" && (
          <div className="bg-white p-4 rounded shadow space-y-3">

            <h2 className="text-xl font-bold">Crear Evento</h2>

            <input
              placeholder="Nombre del evento"
              className="border p-2 w-full rounded"
              value={newEvent}
              onChange={(e) => setNewEvent(e.target.value)}
            />

            <button
              onClick={createEvent}
              className="bg-purple-600 text-white p-2 rounded w-full"
            >
              Crear Evento
            </button>

            <div>
              {events.map((e) => (
                <div key={e.id} className="border p-2 mt-2 rounded">
                  {e.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADMIN */}
        {view === "admin" && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-bold">Panel Admin</h2>
            <p>Control total del sistema</p>
          </div>
        )}

        <button
          onClick={() => setScannerActive(true)}
          className="bg-black text-white p-2 rounded"
        >
          Escanear QR
        </button>

        <div id="reader"></div>

        {status && <p>{status}</p>}
      </div>
    </div>
  );
}