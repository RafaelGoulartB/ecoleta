import React, { useEffect, useState, FormEvent } from 'react';
import './CreatePoint.css';
import logo from '../../assets/logo.svg'
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import api from '../../services/api';
import axios from 'axios';

interface Item {
  id: number;
  title: string;
  image_url: string;
}
interface IBGEUFResponse {
  sigla: string;
}
interface IBGECityResponse {
  nome: string;
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);
  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const history = useHistory();

  useEffect(() => {
    api.get('items')
      .then(response => {
        setItems(response.data);
      })
  }, []);

  useEffect(() => {
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(response => {
        const ufInitials = response.data.map(uf => uf.sigla)
        setUfs(ufInitials)
      })
  }, [])

  useEffect(() => {
    if(selectedUf === '0') return;
    axios
      .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
      .then(response => {
        const citiesResponse = response.data.map(city => city.nome);
        setCities(citiesResponse);
      })
  }, [selectedUf])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const data = {
      name,
      email,
      whatsapp,
      uf: selectedUf,
      city: selectedCity,
      latitude: selectedPosition[0],
      longitude: selectedPosition[1],
      items: selectedItems,
    };

    await api.post('points', data);

    alert('Ponto de coleta cadastrado.');

    history.push('/');
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ]);
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta"/>

        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do ponto de coleta</h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input type="text" name="name" id="name" value={name} onChange={e => setName(e.target.value)}/>
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input type="email" name="email" id="email" value={email} onChange={e => setEmail(e.target.value)}/>
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input type="text" name="whatsapp" id="whatsapp" value={whatsapp} onChange={e => setWhatsapp(e.target.value)}/>
            </div>
          </div>

        </fieldset>
        <fieldset>
          <legend>
            <h2>Endereços</h2>
            <span>Selecione um endereço no mapa</span>
          </legend>

          <Map center={[ -21.4689707, -46.7530481 ]} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={selectedPosition}/>
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" onChange={e => {
                const uf = e.target.value;
                setSelectedUf(uf);
              }} value={selectedUf}>
              <option value="0">Selecione sua UF</option>
              {ufs.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select name="city" id="city" onChange={e => {
                const city = e.target.value;
                setSelectedCity(city);
              }} value={selectedCity}>
                <option value="0">Selecione uma cidade</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

        </fieldset>
        <fieldset>
          <legend>
            <h2>Itens de coleta</h2>
          </legend>

          <ul className="items-grid">
            {items.map(item => (
              <li
                className={selectedItems.includes(item.id) ? 'selected' : ''}
                key={item.id} 
                onClick={() => {
                  const alreadySelected = selectedItems.findIndex(itemIndex => itemIndex === item.id);
                  
                  if(alreadySelected >= 0) {
                    const filteredItem = selectedItems.filter(itemFilter => itemFilter !== item.id);
                    setSelectedItems(filteredItem);
                  } else setSelectedItems([...selectedItems, item.id]);
                }}
              >
                <img src={item.image_url} alt={item.title}/>
            <span>{item.title}</span>
              </li>
            ))}
          </ul>

        </fieldset>

        <button type="submit">
          Cadastrar ponto de coleta
        </button>

      </form>
    </div>
  );
}

export default CreatePoint;