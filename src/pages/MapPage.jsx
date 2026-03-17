import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';

const MapPage = () => {
  const mapRef = useRef(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const token = localStorage.getItem('token');

  const parseJwt = (token) => {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (e) { return null; }
  };

  const user = parseJwt(token);
  const isAdmin = user?.role === "Admin" || user?.role === "Moderator";

  useEffect(() => {
    if (window.ymaps) {
      window.ymaps.ready(initMap);
    }

    function initMap() {
      if (mapRef.current.innerHTML !== "") return;

      const map = new window.ymaps.Map(mapRef.current, {
        center: [51.7682, 55.0968],
        zoom: 13,
        controls: ['zoomControl', 'typeSelector', 'fullscreenControl']
      });

      map.behaviors.disable('doubleClickZoom');
      loadPoints(map);

      if (isAdmin) {
        map.events.add('dblclick', (e) => {
          const coords = e.get('coords');
          const type = prompt("Тип точки (Пластик, Бумага):", "Общий");
          if (type) savePoint(map, { latitude: coords[0], longitude: coords[1], type });
        });
      }
    }

    async function loadPoints(map) {
      try {
        const mockPoints = [
          { 
            id: 1, 
            latitude: 51.7682, 
            longitude: 55.0968, 
            type: "Пластик", 
            address: "пр. Гагарина, 21", 
            points: 50,
            img: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=400" 
          },
          { 
            id: 2, 
            latitude: 51.7750, 
            longitude: 55.1000, 
            type: "Бумага", 
            address: "ул. Чкалова, 15", 
            points: 30,
            img: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=400" 
          }
        ];
        mockPoints.forEach(p => addPlacemark(map, p));
      } catch (e) { console.error(e); }
    }

    function addPlacemark(map, point) {
      const placemark = new window.ymaps.Placemark([point.latitude, point.longitude], {
        hintContent: point.type,
        balloonContent: `<b>Тип:</b> ${point.type}`
      },
      {
        iconLayout: 'default#image',
        iconImageHref: '/Resources/point.png',
        iconImageSize: [30,40],
        iconImagrOffset: [-20,-40],
        hasBalloon: false

      }
    );
      placemark.events.add('click', () => {
        console.log("Клик по точке:", point)
        setSelectedPoint(point)
      });
    
    
      map.geoObjects.add(placemark);
    }

    async function savePoint(map, data) {
        const fakeSavedPoint = {
        ...data,
        id: Math.floor(Math.random() * 1000) ,
        
        };

       addPlacemark(map, fakeSavedPoint);
       alert("Точка временно создана (только в этом сеансе)!");
    //   const res = await fetch('/api/map', {
    //     method: 'POST',
    //     headers: { 
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${token}` 
    //     },
    //     body: JSON.stringify(data)
    //   });
    //   if (res.ok) {
    //     const saved = await res.json();
    //     addPlacemark(map, saved);
    //   }
    }
  }, []);

  return (
  <div className="map-page-wrapper"> 
    <Header />
    <div className="map-container">
      <div id="map" ref={mapRef}></div>

      {selectedPoint && ( 
        <div className="sidebar">
          <button className="close-btn" src ={'/Resources/close.png'} onClick={() => setSelectedPoint(null)}>
            <i className='bx bx-x'></i>
          </button>
          <img src={selectedPoint.img || '/Resources/point.png'} alt="point" className="sidebar-img" />
          <div className="sidebar-content">
            <h2 className="sidebar-title">{selectedPoint.type}</h2>
            <p className="sidebar-address">
              <i className='bx bx-map'></i> {selectedPoint.address || 'Адрес не указан'}
            </p>
            <div className="points-pill">
              <i className='bx bxs-zap'></i> +{selectedPoint.points || 0} баллов
            </div>
            <button className="btn-save" style={{ width: '100%', marginTop: '10px' }}>
              Подтвердить сбор
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default MapPage;