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
import { Zap, Plus, Ticket as TicketIcon, ShoppingCart, QrCode, CheckCircle, TrendingUp, Settings } from "lucide-react";

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
    <div className="flex h-screen" style={{ background: "#0a0f1e" }}>

      <Sidebar setView={setView} />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto" style={{ background: "#0a0f1e" }}>

        {/* BIENVENIDA */}
        <div className="rounded-2xl border border-[rgba(255,255,255,0.12)] bg-gradient-to-r from-[rgba(15,23,42,0.6)] to-[rgba(124,58,237,0.2)] backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 text-white">
          <h2 className="text-3xl font-bold mb-2">¡Bienvenido, {user?.username}! 🚀</h2>
          <p className="text-lg text-slate-300 mb-4">Impulsado por Solana</p>
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] mb-2">El futuro del ticketing</h3>
          <p className="text-xl font-semibold text-slate-100 mb-3">ya está aquí</p>
          <p className="text-slate-300">Compra, vende y valida entradas como NFTs en la blockchain más rápida del mundo.</p>
        </div>

        {/* FEATURES */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(15,23,42,0.45)] backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5">
            <h3 className="text-base font-bold text-white mb-2">Tickets NFT</h3>
            <p className="text-sm text-slate-300">Cada entrada es un NFT único en la blockchain de Solana, imposible de falsificar.</p>
          </div>

          <div className="rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(15,23,42,0.45)] backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5">
            <h3 className="text-base font-bold text-white mb-2">Validación QR</h3>
            <p className="text-sm text-slate-300">Escanea y verifica al instante la autenticidad de cada ticket.</p>
          </div>

          <div className="rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(15,23,42,0.45)] backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5">
            <h3 className="text-base font-bold text-white mb-2">Reventa Segura</h3>
            <p className="text-sm text-slate-300">Mercado secundario transparente con precios justos y trazabilidad.</p>
          </div>

          <div className="rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(15,23,42,0.45)] backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5">
            <h3 className="text-base font-bold text-white mb-2">Financiación Transparente</h3>
            <p className="text-sm text-slate-300">Los organizadores recaudan fondos de forma abierta y verificable.</p>
          </div>
        </div>

        {/* WALLET Y META */}
        <div className="flex justify-between items-center">
          <WalletMultiButton />
        </div>

        {/* 💰 FINANCIAMIENTO */}
        <div className="rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(15,23,42,0.45)] backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 text-white">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-5 w-5 text-[#7c3aed]" />
            <h3 className="font-semibold text-slate-100">Meta de Financiamiento</h3>
          </div>
          <p className="text-sm mb-3 text-slate-300">💰 {funds}/{goal} SOL</p>

          <div className="w-full bg-[rgba(255,255,255,0.1)] h-2 rounded-full overflow-hidden">
            <div
              className="h-2 rounded-full"
              style={{ width: `${(funds / goal) * 100}%`, background: "linear-gradient(90deg, #7c3aed, #06b6d4)" }}
            ></div>
          </div>
        </div>

        {/* EVENTOS */}
        {view === "home" && (
          <div className="grid gap-4">
            {events.length === 0 ? (
              <div className="rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(15,23,42,0.45)] backdrop-blur-xl p-8 text-center text-slate-400">
                <TicketIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-white font-semibold">No hay eventos disponibles</p>
              </div>
            ) : (
              events.map((event) => (
                <motion.div
                  key={event.id}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(15,23,42,0.45)] backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 text-white"
                >
                  <h2 className="text-lg font-bold text-white mb-3">{event.name}</h2>

                  <button
                    onClick={mintNFT}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-[rgba(124,58,237,0.6)] bg-[rgba(124,58,237,0.25)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[rgba(124,58,237,0.45)]"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Comprar Ticket
                  </button>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* PERFIL */}
        {view === "profile" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Mis Tickets</h2>

            {tickets.length === 0 ? (
              <div className="rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(15,23,42,0.45)] backdrop-blur-xl p-8 text-center text-slate-400">
                <TicketIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-white font-semibold">No tienes tickets aún</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {tickets.map((t, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(15,23,42,0.45)] backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 text-white"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-slate-400 break-all">{t.slice(0, 16)}...</span>
                      <QrCode className="h-4 w-4 text-[#06b6d4]" />
                    </div>
                    <div className="flex justify-center mb-4">
                      <QRCodeCanvas value={t} size={100} />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => validarNFT(t)}
                        className="flex items-center justify-center gap-1 rounded-lg border border-[rgba(6,182,212,0.5)] bg-[rgba(6,182,212,0.2)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[rgba(6,182,212,0.35)]"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Validar
                      </button>

                      <button
                        onClick={() =>
                          sellTicket({
                            mint: t,
                            owner: publicKey?.toBase58(),
                          })
                        }
                        className="flex items-center justify-center gap-1 rounded-lg border border-[rgba(124,58,237,0.5)] bg-[rgba(124,58,237,0.2)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[rgba(124,58,237,0.35)]"
                      >
                        <TrendingUp className="h-3 w-3" />
                        Vender
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MARKET */}
        {view === "market" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Marketplace</h2>

            {market.length === 0 ? (
              <div className="rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(15,23,42,0.45)] backdrop-blur-xl p-8 text-center text-slate-400">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-white font-semibold">No hay tickets disponibles</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {market.map((t) => (
                  <motion.div
                    key={t.id}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(15,23,42,0.45)] backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 text-white"
                  >
                    <p className="text-xs text-slate-400 break-all mb-3">{t.mint}</p>

                    <button
                      onClick={() => buyTicket(t)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-[rgba(6,182,212,0.6)] bg-[rgba(6,182,212,0.25)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[rgba(6,182,212,0.45)]"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Comprar por {t.price} SOL
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ORGANIZADOR */}
        {view === "organizer" && (
          <div className="rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(15,23,42,0.45)] backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 space-y-4 text-white">

            <div className="flex items-center gap-2 mb-4">
              <Plus className="h-5 w-5 text-[#7c3aed]" />
              <h2 className="text-xl font-bold">Crear Evento</h2>
            </div>

            <div className="flex gap-2">
              <input
                placeholder="Nombre del evento"
                className="flex-1 rounded-lg border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.06)] px-4 py-2 text-sm text-white placeholder:text-slate-500 outline-none"
                value={newEvent}
                onChange={(e) => setNewEvent(e.target.value)}
              />
              <button
                onClick={createEvent}
                className="rounded-lg border border-[rgba(124,58,237,0.6)] bg-[rgba(124,58,237,0.25)] px-6 py-2 font-semibold text-white transition hover:bg-[rgba(124,58,237,0.45)]"
              >
                Crear
              </button>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Eventos Creados</h3>
              {events.map((e) => (
                <div
                  key={e.id}
                  className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-3 mt-2 text-sm text-slate-100"
                >
                  {e.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADMIN */}
        {view === "admin" && (
          <div className="rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(15,23,42,0.45)] backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 text-white">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-3">
              <Settings className="h-5 w-5 text-[#06b6d4]" />
              Panel Admin
            </h2>
            <p className="text-sm text-slate-300">Control total del sistema</p>
          </div>
        )}

        <button
          onClick={() => setScannerActive(true)}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-[rgba(6,182,212,0.6)] bg-[rgba(6,182,212,0.25)] px-4 py-2 font-semibold text-white transition hover:bg-[rgba(6,182,212,0.45)]"
        >
          <QrCode className="h-4 w-4" />
          Escanear QR
        </button>

        <div id="reader"></div>

        {status && <p className="text-sm p-3 rounded-lg bg-[rgba(124,58,237,0.2)] border border-[rgba(124,58,237,0.5)] text-white">{status}</p>}
      </div>
    </div>
  );
}