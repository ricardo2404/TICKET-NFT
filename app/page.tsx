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

  // 💰 FINANCIAMIENTO
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

  // 🎟️ MINT NFT LOGIC
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
      setFunds((prev) => prev + 1);

      await addDoc(collection(db, "tickets"), {
        mint,
        owner: publicKey.toBase58(),
        event: "Evento Web3",
        createdAt: Date.now(),
        forSale: false,
        price: 0,
      });

      setStatus("🎉 NFT creado con éxito");
    } catch (error) {
      console.error(error);
      setStatus("❌ Error creando NFT");
    }
  };

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

  // 📷 SCANNER LOGIC (Corregido para solo inicializar en Organizer)
  useEffect(() => {
    if (!scannerActive || view !== "organizer") return;

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
  }, [scannerActive, view]);

  // 🔥 FIREBASE DATA LOADING
  useEffect(() => {
    const loadData = async () => {
      const eventSnap = await getDocs(collection(db, "events"));
      setEvents(eventSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const marketSnap = await getDocs(collection(db, "market"));
      setMarket(marketSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    loadData();
  }, []);

  const createEvent = async () => {
    if (!newEvent) return;
    const docRef = await addDoc(collection(db, "events"), {
      name: newEvent,
      createdAt: Date.now(),
    });
    setEvents((prev) => [...prev, { id: docRef.id, name: newEvent }]);
    setNewEvent("");
  };

  const sellTicket = async (ticket: any) => {
    await addDoc(collection(db, "market"), {
      ...ticket,
      price: 0.1,
      seller: ticket.owner,
    });
    alert("Ticket listado en Marketplace 🚀");
  };

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
      const signature = await wallet.adapter.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");
      alert("Compra realizada con éxito 🚀");
    } catch (error) {
      console.error(error);
    }
  };

  if (!mounted) return null;
  if (!user) return <Login />;

  return (
    <div className="flex min-h-screen bg-[#0a0a0b] text-white h-screen" style={{ background: "#0a0f1e" }}>
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
          <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(funds / goal) * 100}%` }}
              className="bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 h-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"
            />
          </div>
        </section>

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

          {/* PERFIL: MIS TICKETS */}
          {view === "profile" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black">Mis Activos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {tickets.map((t, i) => (
                  <div key={i} className="bg-[#1c1c1f] p-5 rounded-3xl border border-white/10 text-center">
                    <div className="bg-white p-3 rounded-2xl mb-4 inline-block shadow-xl">
                      <QRCodeCanvas value={t} size={150} />
                    </div>
                    <p className="text-xs text-gray-500 truncate mb-4">{t}</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => validarNFT(t)}
                        className="w-full py-2 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded-xl hover:bg-cyan-500 hover:text-white transition-all font-bold"
                      >
                        Validar
                      </button>
                      <button
                        onClick={() => sellTicket({ mint: t, owner: publicKey?.toBase58() })}
                        className="w-full py-2 bg-yellow-600/20 text-yellow-400 border border-yellow-500/30 rounded-xl hover:bg-yellow-500 hover:text-white transition-all font-bold"
                      >
                        Listar para Venta
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
          {/* MARKETPLACE */}
          {view === "market" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black">Marketplace P2P</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {market.map((t) => (
                  <div key={t.id} className="bg-[#161618] p-6 rounded-3xl border border-white/5 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-purple-400 font-mono mb-2 uppercase tracking-widest">Mint Address</div>
                      <p className="text-sm break-all text-gray-400 mb-6">{t.mint}</p>
                    </div>
                    <button
                      onClick={() => buyTicket(t)}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl font-black text-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
                    >
                      Comprar por {t.price} SOL
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ORGANIZADOR: SCANNER Y CREACIÓN */}
          {view === "organizer" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* CREAR EVENTO */}
              <div className="bg-[#161618] p-8 rounded-3xl border border-white/5 space-y-6">
                <h2 className="text-2xl font-bold italic">Configurar Nuevo Evento</h2>
                <div className="space-y-4">
                  <input
                    placeholder="Ej. Solana Sync Night"
                    className="bg-black/50 border border-white/10 p-4 w-full rounded-2xl focus:border-purple-500 focus:outline-none transition-all"
                    value={newEvent}
                    onChange={(e) => setNewEvent(e.target.value)}
                  />
                  <button
                    onClick={createEvent}
                    className="bg-white text-black w-full py-4 rounded-2xl font-black text-lg hover:bg-purple-500 hover:text-white transition-all shadow-xl"
                  >
                    Publicar Evento
                  </button>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <h3 className="text-gray-500 text-sm mb-4 uppercase">Eventos Activos</h3>
                  {events.map((e) => (
                    <div key={e.id} className="bg-black/30 p-3 mb-2 rounded-xl border border-white/5 text-sm">
                      ✨ {e.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* QR SCANNER (Solo en esta vista) */}
              <div className="bg-[#161618] p-8 rounded-3xl border border-white/5 flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-6 italic text-cyan-400">Validación de Puerta</h2>
                
                {!scannerActive ? (
                  <button
                    onClick={() => setScannerActive(true)}
                    className="flex flex-col items-center justify-center gap-4 group"
                  >
                    <div className="w-24 h-24 bg-cyan-500/10 rounded-full flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform">
                      <span className="text-4xl">📷</span>
                    </div>
                    <span className="text-cyan-400 font-bold tracking-widest uppercase text-xs">Activar Cámara</span>
                  </button>
                ) : (
                  <div className="w-full max-w-sm overflow-hidden rounded-2xl border-2 border-cyan-500 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                    <div id="reader" className="w-full"></div>
                    <button 
                      onClick={() => setScannerActive(false)}
                      className="w-full bg-red-500/20 text-red-500 py-2 text-xs font-bold uppercase tracking-tighter"
                    >
                      Cancelar Escaneo
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* STATUS NOTIFICATION (Toaster style) */}
        {status && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 right-8 bg-white text-black px-6 py-4 rounded-2xl font-bold shadow-2xl border-l-4 border-purple-500 z-50 flex items-center gap-3"
          >
            {status}
            <button onClick={() => setStatus("")} className="ml-4 opacity-30 hover:opacity-100">✕</button>
          </motion.div>
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

      <style jsx global>{`
        .wallet-adapter-button {
          background-color: transparent !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 12px !important;
          font-weight: 700 !important;
          height: 40px !important;
          line-height: 40px !important;
        }
        .wallet-adapter-button:hover {
          background-color: rgba(255,255,255,0.05) !important;
        }
      `}</style>
    </div>
  );
}