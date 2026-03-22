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
    <div className="flex min-h-screen bg-[#0a0a0b] text-white">
      <Sidebar setView={setView} />

      <div className="flex-1 p-8 space-y-8 overflow-y-auto">
        {/* HEADER AREA */}
        <header className="flex justify-between items-center bg-[#161618] p-4 rounded-2xl border border-white/5 shadow-2xl">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Eventure Dashboard
            </h1>
            <p className="text-gray-500 text-sm">Gestiona tus eventos Web3</p>
          </div>
          <div className="wallet-button-modern">
            <WalletMultiButton />
          </div>
        </header>

        {/* 💰 FINANCIAMIENTO CARD */}
        <section className="bg-gradient-to-br from-[#1c1c1f] to-[#161618] p-6 rounded-3xl border border-white/10 shadow-xl">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Recaudación actual</p>
              <h3 className="text-4xl font-black mt-1">{funds} <span className="text-xl text-purple-400">/ {goal} SOL</span></h3>
            </div>
            <p className="text-cyan-400 font-bold">{((funds / goal) * 100).toFixed(0)}%</p>
          </div>
          <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(funds / goal) * 100}%` }}
              className="bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 h-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"
            />
          </div>
        </section>

        {/* MAIN CONTENT AREA */}
        <div className="min-h-[60vh]">
          {/* HOME: EXPLORAR EVENTOS */}
          {view === "home" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  whileHover={{ y: -5 }}
                  className="group bg-[#161618] rounded-3xl p-5 border border-white/5 hover:border-purple-500/50 transition-all shadow-lg"
                >
                  <div className="h-40 bg-gradient-to-tr from-purple-900/20 to-blue-900/20 rounded-2xl mb-4 flex items-center justify-center border border-white/5">
                    <span className="text-4xl opacity-50 text-white">🎫</span>
                  </div>
                  <h2 className="text-xl font-bold mb-4 tracking-tight group-hover:text-purple-400 transition-colors">
                    {event.name}
                  </h2>
                  <button
                    onClick={mintNFT}
                    className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-purple-400 hover:text-white transition-all shadow-lg"
                  >
                    Obtener Ticket NFT
                  </button>
                </motion.div>
              ))}
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